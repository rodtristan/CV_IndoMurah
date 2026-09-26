-- Web Push: langganan notifikasi per browser/perangkat
CREATE TABLE "PushSubscriptions" (
    "ID" SERIAL NOT NULL,
    "UserID" TEXT NOT NULL,
    "Endpoint" TEXT NOT NULL,
    "P256dh" VARCHAR(255) NOT NULL,
    "Auth" VARCHAR(255) NOT NULL,
    "UserAgent" VARCHAR(500),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastSuccessAt" TIMESTAMP(3),

    CONSTRAINT "PushSubscriptions_pkey" PRIMARY KEY ("ID")
);

CREATE UNIQUE INDEX "PushSubscriptions_Endpoint_key" ON "PushSubscriptions"("Endpoint");
CREATE INDEX "PushSubscriptions_UserID_idx" ON "PushSubscriptions"("UserID");

ALTER TABLE "PushSubscriptions" ADD CONSTRAINT "PushSubscriptions_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
