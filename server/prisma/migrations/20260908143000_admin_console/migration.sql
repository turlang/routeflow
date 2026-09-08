ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE TABLE "PlanConfig" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "routesPerMonth" INTEGER,
  "stopsPerRoute" INTEGER,
  "historyDays" INTEGER,
  "drivers" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);
INSERT INTO "PlanConfig" ("id","name","priceCents","routesPerMonth","stopsPerRoute","historyDays","drivers","active","featured","description","updatedAt") VALUES
('FREE','Grátis',0,2,25,30,1,true,false,'Para conhecer o RouteFlow.',CURRENT_TIMESTAMP),
('DRIVER','Motorista',1990,30,80,90,1,true,true,'Para quem faz entregas todos os dias.',CURRENT_TIMESTAMP),
('PRO','Pro',3990,200,200,NULL,1,true,false,'Mais capacidade e histórico completo.',CURRENT_TIMESTAMP),
('TEAM','Equipe',9990,1000,200,NULL,5,true,false,'Operação com vários motoristas.',CURRENT_TIMESTAMP),
('BUSINESS','Business',24990,NULL,500,NULL,NULL,true,false,'Para operações maiores e personalizadas.',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
