"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = void 0;
exports.isSensitiveFieldPath = isSensitiveFieldPath;
exports.assertNoSensitiveQueryFields = assertNoSensitiveQueryFields;
const common_1 = require("@nestjs/common");
const redact_1 = require("../utils/redact");
function isSensitiveFieldPath(path) {
    return String(path)
        .split(/[.,]/)
        .map((p) => p.trim())
        .filter(Boolean)
        .some((p) => (0, redact_1.isSensitiveKey)(p));
}
function collectKeysDeep(value, out, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 10)
        return;
    if (Array.isArray(value)) {
        for (const v of value)
            collectKeysDeep(v, out, depth + 1);
        return;
    }
    for (const [k, v] of Object.entries(value)) {
        out.push(k);
        collectKeysDeep(v, out, depth + 1);
    }
}
function assertNoSensitiveQueryFields(query) {
    if (!query || typeof query !== 'object')
        return;
    const names = [];
    for (const key of ['$select', '$searchFields', '$include']) {
        const v = query[key];
        if (v !== undefined && v !== null)
            names.push(...String(v).split(/[.,]/));
    }
    for (const key of ['$where', '$orderBy']) {
        const v = query[key];
        if (v && typeof v === 'object')
            collectKeysDeep(v, names);
        else if (typeof v === 'string')
            names.push(v);
    }
    const filter = query['$filter'];
    if (filter) {
        const stripped = String(filter).replace(/'[^']*'|"[^"]*"/g, ' ');
        names.push(...(stripped.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []));
    }
    for (const key of Object.keys(query)) {
        if (key.startsWith('$'))
            continue;
        names.push(key.replace(/\[.*$/, ''));
    }
    const bad = names.find((n) => n && (0, redact_1.isSensitiveKey)(n.trim()));
    if (bad) {
        throw new common_1.BadRequestException(`Field "${bad.trim()}" tidak boleh dipakai dalam query`);
    }
}
let QueryService = class QueryService {
    normalizeFieldKey(key) {
        if (!key)
            return key;
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        return capitalized.replace(/Id\b/g, 'ID');
    }
    normalizeFieldPath(path) {
        return path.split('.').map((part) => this.normalizeFieldKey(part)).join('.');
    }
    buildPrismaQuery(query, options) {
        const maxTake = options?.maxTake ?? 100;
        const defaultTake = options?.defaultTake ?? 20;
        assertNoSensitiveQueryFields(query);
        return {
            select: this.parseSelect(query, options?.allowedFields),
            include: this.parseInclude(query, options?.allowedIncludes),
            where: this.parseWhere(query, options?.searchableFields),
            orderBy: this.parseOrderBy(query, options?.allowedSortFields, options?.defaultOrderBy),
            skip: this.parseSkip(query),
            take: this.parseTake(query, maxTake, defaultTake),
        };
    }
    parseWhere(query, defaultSearchFields) {
        const where = {};
        const whereObj = query['$where'];
        if (whereObj && typeof whereObj === 'object') {
            for (const [field, value] of Object.entries(whereObj)) {
                if (field === '_and') {
                    where.AND = this.parseLogicalArray(value);
                    continue;
                }
                if (field === '_or') {
                    where.OR = this.parseLogicalArray(value);
                    continue;
                }
                if (field === '_not') {
                    where.NOT = this.parseLogicalArray(value);
                    continue;
                }
                const normalizedField = this.normalizeFieldKey(field);
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    where[normalizedField] = this.parseOperators(normalizedField, value);
                }
                else {
                    where[normalizedField] = this.castValue(value);
                }
            }
        }
        for (const [key, value] of Object.entries(query)) {
            if (this.isFieldWithOperator(key) && value !== undefined && value !== '') {
                const fieldMatch = key.match(/^(.+)\[(\w+)\]$/);
                if (fieldMatch) {
                    const [, rawFieldName, operator] = fieldMatch;
                    const fieldName = this.normalizeFieldKey(rawFieldName);
                    if (!where[fieldName]) {
                        where[fieldName] = {};
                    }
                    where[fieldName][operator] = this.castValue(value);
                }
            }
        }
        const searchStr = query['$search'];
        if (searchStr && String(searchStr).trim()) {
            const searchFieldsStr = query['$searchFields'];
            const searchFields = searchFieldsStr
                ? String(searchFieldsStr).split(',').map((f) => f.trim()).filter(Boolean)
                : defaultSearchFields || [];
            if (searchFields.length > 0) {
                where.OR = searchFields.map((field) => ({
                    [this.normalizeFieldKey(field)]: { contains: String(searchStr).trim(), mode: 'insensitive' },
                }));
            }
        }
        const filterStr = query['$filter'];
        if (filterStr) {
            const parsed = this.parseODataFilter(String(filterStr));
            Object.assign(where, parsed);
        }
        return where;
    }
    parseOperators(field, operators) {
        const result = {};
        for (const [op, rawValue] of Object.entries(operators)) {
            if (rawValue === undefined || rawValue === null || rawValue === '')
                continue;
            const prismaOp = this.toPrismaOperator(op, rawValue);
            Object.assign(result, prismaOp);
        }
        return result;
    }
    toPrismaOperator(op, rawValue) {
        const value = rawValue;
        const strValue = String(rawValue);
        switch (op.toLowerCase()) {
            case 'eq':
                return { equals: this.castValue(value) };
            case 'ne':
            case 'neq':
                return { not: { equals: this.castValue(value) } };
            case 'gt':
                return { gt: this.castNumeric(value) };
            case 'gte':
                return { gte: this.castNumeric(value) };
            case 'lt':
                return { lt: this.castNumeric(value) };
            case 'lte':
                return { lte: this.castNumeric(value) };
            case 'ieq':
                return { equals: String(value).toLowerCase(), mode: 'insensitive' };
            case 'ine':
                return { not: { equals: String(value).toLowerCase(), mode: 'insensitive' } };
            case 'contains':
                return { contains: String(value), mode: 'insensitive' };
            case 'startswith':
                return { startsWith: String(value), mode: 'insensitive' };
            case 'endswith':
                return { endsWith: String(value), mode: 'insensitive' };
            case 'like':
                return { contains: this.convertLikePattern(strValue), mode: 'insensitive' };
            case 'notlike':
                return { not: { contains: this.convertLikePattern(strValue), mode: 'insensitive' } };
            case 'ilike':
                return { contains: String(value).replace(/%/g, ''), mode: 'insensitive' };
            case 'notilike':
                return { not: { contains: String(value).replace(/%/g, ''), mode: 'insensitive' } };
            case 'matches':
                try {
                    const regex = new RegExp(strValue);
                    return { contains: strValue };
                }
                catch {
                    return { contains: strValue };
                }
            case 'notmatches':
                return { not: { contains: strValue } };
            case 'imatches':
                return { contains: strValue, mode: 'insensitive' };
            case 'notimatches':
                return { not: { contains: strValue, mode: 'insensitive' } };
            case 'trim':
                return { equals: String(value).trim(), mode: 'insensitive' };
            case 'trimeq':
                return { equals: String(value).trim(), mode: 'insensitive' };
            case 'uppereq':
                return { equals: String(value).toUpperCase() };
            case 'lowereq':
                return { equals: String(value).toLowerCase() };
            case 'length':
                return { equals: String(value).length };
            case 'isnull':
                return this.parseNullOperator(strValue, false);
            case 'isnotnull':
                return this.parseNullOperator(strValue, true);
            case 'isempty':
                return { equals: '' };
            case 'isnotempty':
                return { not: { equals: '' } };
            case 'istrue':
                return { equals: true };
            case 'isfalse':
                return { equals: false };
            case 'null':
                return this.parseNullOperator(strValue, false);
            case 'notnull':
                return this.parseNullOperator(strValue, true);
            case 'in':
                return { in: this.parseArrayValue(strValue) };
            case 'notin':
                return { notIn: this.parseArrayValue(strValue) };
            case 'has':
                return { has: this.castValue(value) };
            case 'has_some':
            case 'hassome':
                return { hasSome: this.parseArrayValue(strValue) };
            case 'has_every':
            case 'hasevery':
                return { hasEvery: this.parseArrayValue(strValue) };
            case 'iscontainedin':
            case 'is_contained_in':
                return { isEmpty: false };
            case 'between':
                return this.parseBetween(strValue);
            case 'notbetween':
                return this.parseNotBetween(strValue);
            case 'gtlt':
                return this.parseGtLt(strValue);
            case 'gtelse':
                return this.parseGteLte(strValue);
            case 'dateeq':
                return this.parseDateEq(strValue);
            case 'datene':
                return this.parseDateNe(strValue);
            case 'dategt':
                return this.parseDateGt(strValue, false);
            case 'dategte':
                return this.parseDateGt(strValue, true);
            case 'datelt':
                return this.parseDateLt(strValue, false);
            case 'datelte':
                return this.parseDateLt(strValue, true);
            case 'datebetween':
                return this.parseDateBetween(strValue);
            case 'year':
                return { equals: parseInt(strValue, 10) };
            case 'month':
                return { equals: parseInt(strValue, 10) };
            case 'day':
                return { equals: parseInt(strValue, 10) };
            case 'mod':
            case 'modulo':
                return { equals: 0 };
            case 'iseven':
                return { equals: 0 };
            case 'isodd':
                return { not: { equals: 0 } };
            case 'isdivisibleby':
                return { equals: 0 };
            case 'minlength':
                return { gte: parseInt(strValue, 10) };
            case 'maxlength':
                return { lte: parseInt(strValue, 10) };
            case 'lengthbetween':
                return this.parseBetween(strValue);
            case 'wordcount':
                return { equals: String(value).split(/\s+/).length };
            case 'jsoneq':
                return { equals: this.castValue(value) };
            case 'jsoncontains':
                return { equals: this.castValue(value) };
            case 'jsonhaskey':
            case 'jsonhas_key':
                return { equals: strValue };
            case 'jsonlength':
                return { equals: parseInt(strValue, 10) };
            case 'and':
                return { AND: this.parseLogicalArray(value) };
            case 'or':
                return { OR: this.parseLogicalArray(value) };
            case 'not':
                return { NOT: this.parseLogicalArray(value) };
            case 'exists':
                return { isNot: null };
            case 'notexists':
                return { is: null };
            case 'near':
                return this.parseNear(strValue);
            case 'within':
                return {};
            case 'intersects':
                return {};
            case 'containspoint':
                return {};
            case 'not':
                return { not: this.castValue(value) };
            case 'gte_lt':
                return this.parseGtLt(strValue);
            case 'lte_gt':
                return this.parseGtLt(strValue, true);
            case 'gte_lte':
                return this.parseGteLte(strValue);
            case 'lte_gte':
                return this.parseGteLte(strValue, true);
            default:
                return { [op]: this.castValue(value) };
        }
    }
    parseNullOperator(value, isNotNull) {
        const boolValue = value === 'true' || value === '1' || value === 'yes';
        if (isNotNull || boolValue) {
            return { not: null };
        }
        return { equals: null };
    }
    parseArrayValue(value) {
        return String(value).split(',').map((v) => this.castValue(v.trim()));
    }
    parseBetween(value) {
        const parts = String(value).split(',').map((v) => v.trim());
        if (parts.length !== 2) {
            return { equals: this.castValue(value) };
        }
        const [min, max] = parts.map((v) => this.castValue(v));
        return { gte: min, lte: max };
    }
    parseNotBetween(value) {
        const parts = String(value).split(',').map((v) => v.trim());
        if (parts.length !== 2) {
            return { not: { equals: this.castValue(value) } };
        }
        const [min, max] = parts.map((v) => this.castValue(v));
        return {
            not: { gte: min, lte: max },
        };
    }
    parseGtLt(value, reversed = false) {
        const parts = String(value).split(',').map((v) => v.trim());
        if (parts.length !== 2) {
            return { equals: this.castValue(value) };
        }
        const [a, b] = parts.map((v) => this.castValue(v));
        const [gt, lt] = reversed ? [b, a] : [a, b];
        return { gt, lt };
    }
    parseGteLte(value, reversed = false) {
        const parts = String(value).split(',').map((v) => v.trim());
        if (parts.length !== 2) {
            return { equals: this.castValue(value) };
        }
        const [a, b] = parts.map((v) => this.castValue(v));
        const [gte, lte] = reversed ? [b, a] : [a, b];
        return { gte, lte };
    }
    parseDateEq(value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { equals: value };
        }
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        return { gte: startOfDay, lte: endOfDay };
    }
    parseDateNe(value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { not: { equals: value } };
        }
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        return { not: { gte: startOfDay, lte: endOfDay } };
    }
    parseDateGt(value, inclusive) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return inclusive ? { gt: value } : { gt: value };
        }
        const key = inclusive ? 'gte' : 'gt';
        if (inclusive) {
            date.setUTCHours(23, 59, 59, 999);
        }
        return { [key]: date };
    }
    parseDateLt(value, inclusive) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return inclusive ? { lt: value } : { lt: value };
        }
        const key = inclusive ? 'lte' : 'lt';
        if (inclusive) {
            date.setUTCHours(0, 0, 0, 0);
        }
        return { [key]: date };
    }
    parseDateBetween(value) {
        const parts = String(value).split(',').map((v) => v.trim());
        if (parts.length !== 2) {
            return { equals: value };
        }
        const start = new Date(parts[0]);
        const end = new Date(parts[1]);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { gte: parts[0], lte: parts[1] };
        }
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        return { gte: start, lte: end };
    }
    parseNear(value) {
        const parts = String(value).split(',').map((v) => v.trim());
        if (parts.length !== 3) {
            return {};
        }
        return {};
    }
    convertLikePattern(pattern) {
        let result = pattern;
        if (result.startsWith('%')) {
            result = result.substring(1);
        }
        else {
            result = result;
        }
        if (result.endsWith('%')) {
            result = result.slice(0, -1);
        }
        return result || pattern;
    }
    parseLogicalArray(value) {
        if (!Array.isArray(value)) {
            return [value];
        }
        return value.map((item) => {
            if (typeof item === 'object' && item !== null) {
                const result = {};
                for (const [key, val] of Object.entries(item)) {
                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                        result[key] = this.parseOperators(key, val);
                    }
                    else {
                        result[key] = this.castValue(val);
                    }
                }
                return result;
            }
            return this.castValue(item);
        });
    }
    parseODataFilter(filter) {
        const result = {};
        const normalized = filter.replace(/\s+/g, ' ').trim();
        const andParts = this.splitByLogical(normalized, ' and ');
        if (andParts.length > 1) {
            result.AND = andParts.map((part) => this.parseODataFilter(part.trim()));
            return result;
        }
        const orParts = this.splitByLogical(normalized, ' or ');
        if (orParts.length > 1) {
            result.OR = orParts.map((part) => this.parseODataFilter(part.trim()));
            return result;
        }
        const condition = this.parseODataCondition(normalized);
        if (condition) {
            Object.assign(result, condition);
        }
        return result;
    }
    splitByLogical(expr, separator) {
        const parts = [];
        let depth = 0;
        let current = '';
        const lower = expr.toLowerCase();
        const sepLower = separator.toLowerCase();
        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];
            if (char === '(')
                depth++;
            else if (char === ')')
                depth--;
            else if (depth === 0 && lower.startsWith(sepLower, i)) {
                parts.push(current.trim());
                current = '';
                i += sepLower.length - 1;
                continue;
            }
            current += char;
        }
        parts.push(current.trim());
        return parts;
    }
    parseODataCondition(expr) {
        const operators = [
            ' eq ', ' ne ', ' neq ', ' gt ', ' gte ', ' lt ', ' lte ',
            ' contains ', ' startswith ', ' endswith ',
            ' like ', ' in ', ' between ',
        ];
        for (const op of operators) {
            const idx = expr.toLowerCase().indexOf(op);
            if (idx !== -1) {
                const field = expr.substring(0, idx).trim();
                const rawValue = expr.substring(idx + op.length).trim();
                const value = this.parseODataValue(rawValue);
                const opLower = op.trim().toLowerCase();
                switch (opLower) {
                    case 'eq': return { [field]: { equals: value } };
                    case 'ne':
                    case 'neq': return { [field]: { not: { equals: value } } };
                    case 'gt': return { [field]: { gt: value } };
                    case 'gte': return { [field]: { gte: value } };
                    case 'lt': return { [field]: { lt: value } };
                    case 'lte': return { [field]: { lte: value } };
                    case 'contains': return { [field]: { contains: value, mode: 'insensitive' } };
                    case 'startswith': return { [field]: { startsWith: value, mode: 'insensitive' } };
                    case 'endswith': return { [field]: { endsWith: value, mode: 'insensitive' } };
                    case 'in': return { [field]: { in: this.parseInValue(rawValue) } };
                    case 'between': return this.parseBetween(value);
                }
            }
        }
        return {};
    }
    parseODataValue(value) {
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
            return value.slice(1, -1);
        }
        return this.castValue(value);
    }
    parseInValue(value) {
        const match = value.match(/^\((.+)\)$/);
        if (match) {
            return match[1].split(',').map((v) => this.parseODataValue(v.trim()));
        }
        return [];
    }
    castValue(raw) {
        if (raw === undefined || raw === null)
            return raw;
        if (typeof raw === 'object')
            return raw;
        const str = String(raw);
        if (str === 'true')
            return true;
        if (str === 'false')
            return false;
        if (str === 'null')
            return null;
        if (/^-?\d+$/.test(str))
            return parseInt(str, 10);
        if (/^-?\d+\.\d+$/.test(str))
            return parseFloat(str);
        if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(str)) {
            const date = new Date(str);
            if (!isNaN(date.getTime()))
                return date;
        }
        return str;
    }
    castNumeric(value) {
        const casted = this.castValue(value);
        if (casted instanceof Date)
            return casted;
        return casted;
    }
    parseSelect(query, allowedFields) {
        const selectStr = query['$select'];
        if (!selectStr)
            return undefined;
        const fields = String(selectStr).split(',').map((f) => f.trim()).filter(Boolean);
        if (fields.length === 0)
            return undefined;
        const allowAll = allowedFields?.includes('*');
        const select = {};
        for (const rawField of fields) {
            const field = this.normalizeFieldKey(rawField);
            if (allowAll || !allowedFields || allowedFields.includes(field) || allowedFields.includes(rawField)) {
                select[field] = true;
            }
        }
        return Object.keys(select).length > 0 ? select : undefined;
    }
    parseInclude(query, allowedIncludes) {
        const includeStr = query['$include'];
        if (!includeStr)
            return undefined;
        const relations = String(includeStr).split(',').map((r) => r.trim()).filter(Boolean);
        if (relations.length === 0)
            return undefined;
        const allowAll = allowedIncludes?.includes('*');
        const include = {};
        for (const rawRelation of relations) {
            const relation = this.normalizeFieldPath(rawRelation);
            const rootRelation = relation.split('.')[0];
            const rawRoot = rawRelation.split('.')[0];
            if (!allowAll &&
                allowedIncludes &&
                !allowedIncludes.includes(rootRelation) &&
                !allowedIncludes.includes(rawRoot)) {
                continue;
            }
            const parts = relation.split('.');
            if (parts.length === 1) {
                include[parts[0]] = true;
            }
            else {
                let current = include;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        if (typeof current[part] !== 'object') {
                            current[part] = true;
                        }
                    }
                    else {
                        if (current[part] === true || !current[part]) {
                            current[part] = { include: {} };
                        }
                        current = current[part].include;
                    }
                }
            }
        }
        return Object.keys(include).length > 0 ? include : undefined;
    }
    parseOrderBy(query, allowedSortFields, defaultOrderBy) {
        const orderByObj = query['$orderBy'];
        if (!orderByObj || typeof orderByObj !== 'object') {
            return defaultOrderBy || { CreatedAt: 'desc' };
        }
        const allowAll = allowedSortFields?.includes('*');
        const orderByArray = [];
        for (const [rawField, direction] of Object.entries(orderByObj)) {
            if (!allowAll && allowedSortFields && !allowedSortFields.includes(rawField) && !allowedSortFields.includes(this.normalizeFieldKey(rawField)))
                continue;
            const dir = String(direction).toLowerCase();
            if (dir === 'asc' || dir === 'desc') {
                orderByArray.push({ [this.normalizeFieldKey(rawField)]: dir });
            }
        }
        return orderByArray.length > 0
            ? orderByArray.length === 1
                ? orderByArray[0]
                : orderByArray
            : defaultOrderBy || { CreatedAt: 'desc' };
    }
    parseSkip(query) {
        const skip = parseInt(query['$skip'], 10);
        return isNaN(skip) || skip < 0 ? 0 : skip;
    }
    parseTake(query, maxTake, defaultTake) {
        const take = parseInt(query['$take'], 10);
        if (isNaN(take) || take < 1)
            return defaultTake;
        return Math.min(take, maxTake);
    }
    isFieldWithOperator(key) {
        return /^[a-zA-Z_][a-zA-Z0-9_]*\[\w+\]$/.test(key);
    }
    generateCacheKey(prefix, query) {
        const sorted = JSON.stringify(query, Object.keys(query).sort());
        let hash = 0;
        for (let i = 0; i < sorted.length; i++) {
            const char = sorted.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return `${prefix}:${hash}`;
    }
    buildWhere(conditions) {
        const where = {};
        for (const [key, value] of Object.entries(conditions)) {
            if (value === undefined)
                continue;
            if (value && typeof value === 'object') {
                where[key] = this.parseOperators(key, value);
            }
            else {
                where[key] = this.castValue(value);
            }
        }
        return where;
    }
    and(...conditions) {
        return { AND: conditions };
    }
    or(...conditions) {
        return { OR: conditions };
    }
    not(condition) {
        return { NOT: condition };
    }
    in(field, values) {
        return { [field]: { in: values } };
    }
    notIn(field, values) {
        return { [field]: { notIn: values } };
    }
    between(field, min, max) {
        return { [field]: { gte: this.castValue(min), lte: this.castValue(max) } };
    }
    like(field, pattern) {
        return { [field]: { contains: pattern.replace(/%/g, ''), mode: 'insensitive' } };
    }
    isNull(field) {
        return { [field]: null };
    }
    isNotNull(field) {
        return { [field]: { not: null } };
    }
};
exports.QueryService = QueryService;
exports.QueryService = QueryService = __decorate([
    (0, common_1.Injectable)()
], QueryService);
