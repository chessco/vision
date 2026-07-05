import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toApiTenantId } from '../../../utils/tenant';

export function VerticalGeneratorsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [loading, setLoading] = useState<string | null>(null);

  const verticals = [
    {
      id: 'acuacore',
      name: 'AcuaCore (Aquaculture)',
      description: 'Genera material educativo visual sobre oxigenación, alimentación y salud piscícola.',
      icon: '🐟',
      sampleInput: {
        topic: 'Alimentación temprana de alevines',
        focus: 'Crecimiento rápido',
        audience: 'Operarios de campo'
      }
    },
    {
      id: 'mando',
      name: 'Mando (Political)',
      description: 'Genera gráficas de campaña política y propaganda de alto impacto.',
      icon: '🗳️',
      sampleInput: {
        campaign: 'Elecciones 2026',
        theme: 'Crecimiento económico y esperanza',
        colors: ['Azul', 'Blanco']
      }
    },
    {
      id: 'luxuryos',
      name: 'LuxuryOS (Jewelry)',
      description: 'Genera renders fotorrealistas de joyería de lujo a partir de especificaciones.',
      icon: '💎',
      sampleInput: {
        material: 'Oro rosa 18k',
        gemstone: 'Diamante corte esmeralda',
        style: 'Minimalista y elegante'
      }
    }
  ];

  const handleGenerate = async (verticalId: string, inputData: any) => {
    if (!tenantId) return;
    setLoading(verticalId);
    try {
      const res = await axios.post(`/api/tenants/${apiTenantId}/vision/connectors/generate`, {
        verticalId,
        inputData
      });
      alert('Asset generado exitosamente: ' + res.data.asset.url);
    } catch (err) {
      console.error(err);
      alert('Error generando asset para ' + verticalId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-light tracking-wide text-ink-text mb-2">
          Vertical Connectors (Labs)
        </h1>
        <p className="text-ink-subtle">
          Simulador de integraciones B2B. Dispara generaciones visuales de manera automatizada como si fueras otra aplicación satélite de PitayaCore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {verticals.map((vertical) => (
          <div key={vertical.id} className="bg-paper-surface border border-border-subtle rounded-xl p-6 flex flex-col">
            <div className="text-4xl mb-4">{vertical.icon}</div>
            <h2 className="text-2xl font-display text-ink-text mb-2">{vertical.name}</h2>
            <p className="text-ink-subtle text-sm mb-6 flex-1">{vertical.description}</p>

            <div className="bg-background border border-border-subtle rounded-md p-4 mb-6">
              <h3 className="text-xs font-mono text-ink-subtle uppercase tracking-wider mb-2">Payload Simulado</h3>
              <pre className="text-xs text-ink-text overflow-x-auto">
                {JSON.stringify(vertical.sampleInput, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => handleGenerate(vertical.id, vertical.sampleInput)}
              disabled={loading === vertical.id}
              className={`w-full py-3 rounded-md font-medium transition-colors
                ${loading === vertical.id 
                  ? 'bg-surface-container text-ink-subtle cursor-not-allowed' 
                  : 'bg-primary hover:bg-secondary text-background'}
              `}
            >
              {loading === vertical.id ? 'Generando...' : `Disparar API (${vertical.id})`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
