import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { getInitialSeedEquipment, getInitialSeedLoads, getInitialSeedRooms, generateSampleValidCsv, generateSampleValidJson, generateCombinedBadDemoCsv, generateCombinedBadDemoJson } from './src/data/seed.ts';
import { validateIngestionFile } from './src/logic/validation/validateFile.ts';
import { allocateLoads } from './src/logic/planner/allocate.ts';
import { evaluateSafety } from './src/logic/safety/evaluateSafety.ts';
import { generateSafeAuditCsv } from './src/logic/audit/auditLog.ts';
import { calculateCampusKpis } from './src/logic/monitor/kpis.ts';
import { AuditRecord, ScenarioInputs } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.text({ limit: '10mb', type: ['text/csv', 'text/plain'] }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // 1. Health & Server Telemetry
  app.get('/api/health', (_req: Request, res: Response) => {
    const now = new Date();
    const kolkataTime = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(now);

    res.json({
      status: 'operational',
      system: 'ZHATKA Adaptive Campus Energy Response Planner',
      version: '2.0.0-hackathon-prototype',
      clock: {
        utc: now.toISOString(),
        asiaKolkata: kolkataTime,
      },
      engines: {
        monitor: 'ACTIVE',
        validationPipeline: 'ACTIVE_7_STAGE',
        adaptivePlanner: 'ACTIVE_DETERMINISTIC_P0_P3',
        equipmentShield: 'ACTIVE',
        auditEngine: 'ACTIVE_APPEND_ONLY',
      },
      securityNotice: 'Client & Server dual-layer simulated data validation active.',
    });
  });

  // 2. Initial / Seed Data & Scenarios
  app.get('/api/seed', (_req: Request, res: Response) => {
    const nowIso = new Date().toISOString();
    const rooms = getInitialSeedRooms(nowIso);
    const equipment = getInitialSeedEquipment();
    const loads = getInitialSeedLoads();
    const kpis = calculateCampusKpis(rooms, equipment);

    res.json({
      rooms,
      equipment,
      loads,
      kpis,
      loadedAt: nowIso,
    });
  });

  // 3. Dynamic Sample File Downloads (Fresh timestamps so readings pass freshness check!)
  app.get('/api/sample-files/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const nowIso = new Date().toISOString();

    if (filename === 'sample_valid.csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sample_valid.csv"');
      return res.send(generateSampleValidCsv(nowIso));
    }
    if (filename === 'sample_valid.json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="sample_valid.json"');
      return res.send(generateSampleValidJson(nowIso));
    }
    if (filename === 'sample_bad_demo.csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sample_bad_demo.csv"');
      return res.send(generateCombinedBadDemoCsv(nowIso));
    }
    if (filename === 'sample_bad_demo.json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="sample_bad_demo.json"');
      return res.send(generateCombinedBadDemoJson(nowIso));
    }

    return res.status(404).json({ error: 'Sample file not found.' });
  });

  // 4. Server-Side Data Ingestion Validation Endpoint (7-Stage Pipeline)
  app.post('/api/validate', async (req: Request, res: Response) => {
    try {
      const { content, fileName, fileSizeBytes, knownRooms } = req.body;
      if (!content || !fileName) {
        return res.status(400).json({ error: 'content and fileName are required.' });
      }

      const size = fileSizeBytes || Buffer.byteLength(content, 'utf8');
      const report = await validateIngestionFile(content, fileName, size, {
        knownRooms,
        nowIso: new Date().toISOString(),
      });

      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Validation pipeline execution failed.',
        details: err?.message,
      });
    }
  });

  // 5. Server-Side Adaptive Resource Allocation
  app.post('/api/planner/allocate', (req: Request, res: Response) => {
    try {
      const { loads, inputs } = req.body as { loads: any[]; inputs: ScenarioInputs };
      if (!loads || !inputs) {
        return res.status(400).json({ error: 'loads and inputs parameters are required.' });
      }

      const planResult = allocateLoads(loads, inputs);
      return res.json(planResult);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Planner allocation execution failed.',
        details: err?.message,
      });
    }
  });

  // 6. Server-Side Safety Decision Check
  app.post('/api/safety/evaluate', (req: Request, res: Response) => {
    try {
      const { context, action } = req.body;
      if (!context || !action) {
        return res.status(400).json({ error: 'context and action parameters are required.' });
      }

      const result = evaluateSafety(context, action);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({
        error: 'Safety evaluation failed.',
        details: err?.message,
      });
    }
  });

  // 7. Formula-Safe Audit CSV Export
  app.post('/api/export/audit-csv', (req: Request, res: Response) => {
    try {
      const events: AuditRecord[] = req.body.events || [];
      const csv = generateSafeAuditCsv(events);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="zhatka_audit_log.csv"');
      return res.send(csv);
    } catch (err: any) {
      return res.status(500).json({
        error: 'CSV generation failed.',
        details: err?.message,
      });
    }
  });

  // ==========================================
  // VITE DEV SERVER / STATIC ASSETS
  // ==========================================
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZHATKA Backend] Express server running at http://0.0.0.0:${PORT}`);
    console.log(`[ZHATKA Backend] Dual client/server validation and planner ready.`);
  });
}

startServer().catch((err) => {
  console.error('[ZHATKA Backend Error]', err);
  process.exit(1);
});
