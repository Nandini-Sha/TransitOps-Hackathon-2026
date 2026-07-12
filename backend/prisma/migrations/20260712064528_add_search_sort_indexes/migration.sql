-- CreateIndex
CREATE INDEX "DriverProfile_name_idx" ON "DriverProfile"("name");

-- CreateIndex
CREATE INDEX "DriverProfile_licenseExpiry_idx" ON "DriverProfile"("licenseExpiry");

-- CreateIndex
CREATE INDEX "DriverProfile_createdAt_idx" ON "DriverProfile"("createdAt");

-- CreateIndex
CREATE INDEX "Trip_createdAt_idx" ON "Trip"("createdAt");

-- CreateIndex
CREATE INDEX "Vehicle_name_idx" ON "Vehicle"("name");

-- CreateIndex
CREATE INDEX "Vehicle_createdAt_idx" ON "Vehicle"("createdAt");
