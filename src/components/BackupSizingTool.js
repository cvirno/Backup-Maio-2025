import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, TextField, Typography, Paper, Divider,
  Slider, InputAdornment, FormControl, RadioGroup,
  FormControlLabel, Radio, Button, LinearProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, IconButton, MenuItem, Chip, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Storage as StorageIcon,
  Backup as BackupIcon,
  Timeline as TimelineIcon,
  ShowChart as GrowthIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  DataUsage as DataIcon,
  Dns as NodeIcon,
  SdStorage as DiskIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  VerifiedUser as VerifiedIcon,
  ShowChart as ChartIcon
} from '@mui/icons-material';

/*
 * INFINISIZING BACKUP
 * Desenvolvido por Cesaar Virno
 * Ferramenta de Dimensionamento Avançado para Infraestrutura de Backup
 */

const DISK_TYPES = {
  CACHE: [
    { name: "SSD 480GB", size: 480, throughput: 3.5, color: "#4fc3f7" },
    { name: "SSD 960GB", size: 960, throughput: 3.5, color: "#26c6da" },
    { name: "SSD 1.92TB", size: 1920, throughput: 3.5, color: "#00acc1" },
    { name: "SSD 3.84TB", size: 3840, throughput: 3.5, color: "#0097a7" },
    { name: "SSD 7.68TB", size: 7680, throughput: 3.5, color: "#00838f" },
    { name: "SSD 15.36TB", size: 15360, throughput: 3.5, color: "#006064" }
  ],
  DATA: [
    { name: "HDD 2TB", size: 2000, throughput: 0.2, color: "#66bb6a" },
    { name: "HDD 4TB", size: 4000, throughput: 0.2, color: "#4caf50" },
    { name: "HDD 6TB", size: 6000, throughput: 0.25, color: "#43a047" },
    { name: "HDD 8TB", size: 8000, throughput: 0.25, color: "#388e3c" },
    { name: "HDD 10TB", size: 10000, throughput: 0.3, color: "#2e7d32" },
    { name: "HDD 12TB", size: 12000, throughput: 0.3, color: "#1b5e20" },
    { name: "HDD 16TB", size: 16000, throughput: 0.35, color: "#81c784" },
    { name: "HDD 18TB", size: 18000, throughput: 0.35, color: "#a5d6a7" },
    { name: "HDD 20TB", size: 20000, throughput: 0.4, color: "#c8e6c9" },
    { name: "HDD 22TB", size: 22000, throughput: 0.4, color: "#e8f5e9" }
  ]
};

const MAX_DISKS_PER_NODE = 12;

// Cenários de Disaster Recovery
const DR_SCENARIOS = [
  { 
    id: 1,
    name: "Tier 1 (Crítico)", 
    description: "SLA Corporativo para cargas de trabalho essenciais",
    rto: "1 hora",
    rpo: "15 minutos",
    costMultiplier: 3.5,
    features: [
      "Replicação síncrona",
      "Failover automático",
      "Snapshots a cada 15 min",
      "Infraestrutura dedicada"
    ],
    compliance: ["LGPD", "SOX", "HIPAA"]
  },
  { 
    id: 2,
    name: "Tier 2 (Importante)", 
    description: "Para aplicações de negócios importantes",
    rto: "4 horas",
    rpo: "1 hora",
    costMultiplier: 2.0,
    features: [
      "Replicação assíncrona",
      "Failover manual",
      "Backups horários",
      "Infra compartilhada"
    ],
    compliance: ["LGPD"]
  },
  { 
    id: 3,
    name: "Tier 3 (Básico)", 
    description: "Para dados não críticos e arquivamento",
    rto: "24 horas",
    rpo: "24 horas",
    costMultiplier: 1.0,
    features: [
      "Backups diários",
      "Restauração sob demanda",
      "Armazenamento padrão"
    ],
    compliance: []
  }
];

// Configurações de Growth Scaling
const GROWTH_SCENARIOS = [
  { year: 1, growthRate: 10 },
  { year: 2, growthRate: 20 },
  { year: 3, growthRate: 30 },
  { year: 4, growthRate: 40 },
  { year: 5, growthRate: 50 }
];

const ConfigCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  marginBottom: theme.spacing(3)
}));

const ResultCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '10px',
  backgroundColor: '#f8fafc',
  borderLeft: `4px solid ${color || '#1976d2'}`,
  height: '100%'
}));

const DiskConfigurator = ({ title, diskType, disks, maxDisks, onDiskChange, onCountChange }) => {
  const diskOptions = DISK_TYPES[diskType];
  const currentDisk = disks[0]?.name || 'Nenhum selecionado';

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ 
        mb: 2, 
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center'
      }}>
        <DiskIcon sx={{ mr: 1, color: diskType === 'CACHE' ? '#4fc3f7' : '#66bb6a' }} />
        {title}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          fullWidth
          label="Modelo de Disco"
          value={currentDisk}
          onChange={(e) => {
            const selectedDisk = diskOptions.find(d => d.name === e.target.value);
            if (selectedDisk) onDiskChange(selectedDisk);
          }}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          {diskOptions.map((disk) => (
            <MenuItem key={disk.name} value={disk.name} sx={{ color: disk.color }}>
              {disk.name} - {disk.throughput} GB/s
            </MenuItem>
          ))}
        </TextField>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: '#4a5568' }}>
            Quantidade:
          </Typography>
          <IconButton 
            onClick={() => onCountChange(Math.max(0, disks.length - 1))}
            disabled={disks.length <= 0}
            sx={{ color: '#4a5568' }}
          >
            <RemoveIcon />
          </IconButton>
          <Typography variant="body1" sx={{ minWidth: '30px', textAlign: 'center' }}>
            {disks.length}
          </Typography>
          <IconButton 
            onClick={() => onCountChange(Math.min(maxDisks, disks.length + 1))}
            disabled={disks.length >= maxDisks}
            sx={{ color: '#4a5568' }}
          >
            <AddIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: '#718096', ml: 'auto' }}>
            Máx: {maxDisks}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const DRScenarioCard = ({ scenario, isSelected, onSelect }) => {
  return (
    <Paper 
      onClick={() => onSelect(scenario)}
      sx={{
        p: 2,
        mb: 2,
        border: isSelected ? '2px solid #3182ce' : '1px solid #e2e8f0',
        backgroundColor: isSelected ? '#ebf8ff' : '#ffffff',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#f7fafc'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">{scenario.name}</Typography>
        <Chip 
          label={`${scenario.rto} RTO / ${scenario.rpo} RPO`} 
          color={isSelected ? "primary" : "default"}
        />
      </Box>
      <Typography variant="body2" sx={{ mt: 1, color: '#4a5568' }}>
        {scenario.description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Recursos:</Typography>
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          {scenario.features.map((feature, index) => (
            <li key={index} style={{ color: '#4a5568', fontSize: '0.875rem' }}>{feature}</li>
          ))}
        </ul>
      </Box>
      {scenario.compliance.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Conformidade:</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {scenario.compliance.map((item) => (
              <Chip 
                key={item}
                icon={<VerifiedIcon fontSize="small" />}
                label={item}
                size="small"
                color="success"
              />
            ))}
          </Box>
        </Box>
      )}
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Custo relativo: {scenario.costMultiplier}x o Tier 3
      </Typography>
    </Paper>
  );
};

const GrowthProjectionChart = ({ projections }) => {
  return (
    <Box sx={{ 
      p: 2, 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <ChartIcon sx={{ mr: 1, color: '#3182ce' }} />
        Projeção de Crescimento
      </Typography>
      
      <Box sx={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        mt: 4,
        borderBottom: '1px solid #e2e8f0',
        position: 'relative'
      }}>
        {projections.map((proj, index) => {
          const height = 20 + (proj.growthRate * 3);
          const isCritical = proj.growthRate > 30;
          return (
            <Box key={index} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '60px'
            }}>
              <Tooltip title={`Ano ${proj.year}: ${proj.growthRate}% crescimento`}>
                <Box
                  sx={{
                    width: '40px',
                    height: `${height}px`,
                    backgroundColor: isCritical ? '#e53e3e' : '#3182ce',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                />
              </Tooltip>
              <Typography variant="caption" sx={{ mt: 1 }}>
                Ano {proj.year}
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: isCritical ? 700 : 400,
                color: isCritical ? '#e53e3e' : 'inherit'
              }}>
                {proj.growthRate}%
              </Typography>
            </Box>
          );
        })}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        {projections.some(proj => proj.growthRate > 30) && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Taxas de crescimento acima de 30% exigirão reavaliação arquitetural no Ano {projections.find(proj => proj.growthRate > 30).year}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

// Tipos de dados
const DATA_TYPES = {
  '1': { name: 'Banco de Dados', compression: 0.7, growthRate: 0.05 },
  '2': { name: 'Arquivos de Log', compression: 0.5, growthRate: 0.1 },
  '3': { name: 'Sistema de Arquivos', compression: 0.4, growthRate: 0.15 },
  '4': { name: 'Virtual Machines', compression: 0.3, growthRate: 0.2 },
  '5': { name: 'Outros', compression: 0.2, growthRate: 0.1 }
};

// Opções de armazenamento
const STORAGE_OPTIONS = {
  '1': { name: 'HDD', speed: 'slow' },
  '2': { name: 'SSD', speed: 'medium' },
  '3': { name: 'Tape', speed: 'slow' },
  '4': { name: 'Cloud', speed: 'variable' }
};

// Políticas de retenção
const RETENTION_OPTIONS = {
  '1': { name: 'Curto Prazo (7 dias)', days: 7 },
  '2': { name: 'Médio Prazo (30 dias)', days: 30 },
  '3': { name: 'Longo Prazo (1 ano)', days: 365 },
  '4': { name: 'Arquivamento (5 anos)', days: 1825 }
};

// Tipos de backup
const BACKUP_TYPES = {
  '1': { name: 'Completo', frequency: 'daily', sizeFactor: 1.0 },
  '2': { name: 'Incremental', frequency: 'daily', sizeFactor: 0.1 },
  '3': { name: 'Diferencial', frequency: 'daily', sizeFactor: 0.3 },
  '4': { name: 'Snapshot', frequency: 'hourly', sizeFactor: 0.05 }
};

const BackupSizingTool = () => {
  const [inputs, setInputs] = useState({
    originalDataSizeTB: 10,
    dailyChangeRate: 5,
    retentionDays: 30,
    compressionRatio: 2,
    annualGrowthRate: 10,
    forecastYears: 3,
    protectionLevel: 'standard',
    cacheDisks: Array(4).fill(DISK_TYPES.CACHE[2]),
    dataDisks: Array(8).fill(DISK_TYPES.DATA[5]),
    cacheOverhead: 5,
    dataOverhead: 7,
    manualAppliances: 3,
    selectedDRScenario: DR_SCENARIOS[1] // Default to Tier 2
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const calculateRequirements = useCallback(() => {
    const {
      originalDataSizeTB,
      dailyChangeRate,
      retentionDays,
      compressionRatio,
      annualGrowthRate,
      forecastYears,
      protectionLevel,
      cacheDisks,
      dataDisks,
      cacheOverhead,
      dataOverhead,
      manualAppliances,
      selectedDRScenario
    } = inputs;

    const growthFactor = Math.pow(1 + annualGrowthRate / 100, forecastYears);
    const projectedDataSizeTB = originalDataSizeTB * growthFactor;
    const dailyChangedDataTB = projectedDataSizeTB * (dailyChangeRate / 100);
    const dailyBackupSizeTB = dailyChangedDataTB / compressionRatio;
    const backupStorageTB = dailyBackupSizeTB * retentionDays;
    const protectionFactor = protectionLevel === 'standard' ? 2 : 3;
    const totalProtectedStorageTB = backupStorageTB * protectionFactor;

    const cacheCapacityTB = cacheDisks.reduce((sum, disk) => sum + disk.size, 0) * (1 - cacheOverhead / 100) / 1000;
    const dataCapacityTB = dataDisks.reduce((sum, disk) => sum + disk.size, 0) * (1 - dataOverhead / 100) / 1000;
    const totalApplianceCapacityTB = cacheCapacityTB + dataCapacityTB;

    const cacheThroughput = cacheDisks.reduce((sum, disk) => sum + disk.throughput, 0);
    const dataThroughput = dataDisks.reduce((sum, disk) => sum + disk.throughput, 0);
    const totalThroughputTBh = (cacheThroughput + dataThroughput) * 3.6;

    const calculatedAppliances = Math.ceil(totalProtectedStorageTB / totalApplianceCapacityTB);
    const finalAppliances = Math.max(calculatedAppliances, manualAppliances);
    
    const requiredDailyThroughputTB = dailyBackupSizeTB;
    const clusterThroughputTBh = totalThroughputTBh * finalAppliances;
    const throughputSufficient = clusterThroughputTBh >= requiredDailyThroughputTB;

    // Calculate DR-adjusted costs
    const baseCost = totalApplianceCapacityTB * finalAppliances * 1500; // Example cost model
    const drAdjustedCost = baseCost * selectedDRScenario.costMultiplier;

    // Generate growth projections
    const growthProjections = GROWTH_SCENARIOS.map(scenario => ({
      year: scenario.year,
      growthRate: annualGrowthRate * (1 + (scenario.year / 10)), // Compound growth
      projectedSize: originalDataSizeTB * Math.pow(1 + (annualGrowthRate * (1 + (scenario.year / 10)))/100, scenario.year)
    }));

    setResults({
      projectedDataSizeTB: projectedDataSizeTB.toFixed(2),
      dailyBackupSizeTB: dailyBackupSizeTB.toFixed(2),
      backupStorageTB: backupStorageTB.toFixed(2),
      totalProtectedStorageTB: totalProtectedStorageTB.toFixed(2),
      perAppliance: {
        cacheCapacityTB: cacheCapacityTB.toFixed(2),
        dataCapacityTB: dataCapacityTB.toFixed(2),
        totalCapacityTB: totalApplianceCapacityTB.toFixed(2),
        throughputTBh: totalThroughputTBh.toFixed(2)
      },
      calculatedAppliances,
      finalAppliances,
      clusterThroughputTBh: clusterThroughputTBh.toFixed(2),
      throughputSufficient,
      requiredDailyThroughputTB: requiredDailyThroughputTB.toFixed(2),
      protectionFactor,
      storageUtilization: ((totalProtectedStorageTB / (totalApplianceCapacityTB * finalAppliances)) * 100).toFixed(1),
      drAdjustedCost: drAdjustedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      growthProjections
    });
  }, [inputs]);

  useEffect(() => {
    calculateRequirements();
  }, [calculateRequirements]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDRScenarioSelect = (scenario) => {
    setInputs(prev => ({
      ...prev,
      selectedDRScenario: scenario
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <Typography variant="h4" sx={{ 
        mb: 1,
        fontWeight: 700,
        color: '#1a365d',
        display: 'flex',
        alignItems: 'center'
      }}>
        <StorageIcon sx={{ mr: 2, color: '#3182ce' }} />
        InfiniSizing Backup
      </Typography>
      
      <Typography variant="subtitle2" sx={{ mb: 3, color: '#4a5568', fontStyle: 'italic' }}>
        Desenvolvido por Cesar Virno
      </Typography>
      
      <Grid container spacing={3}>
        {/* Painel de Configuração */}
        <Grid item xs={12} md={5}>
          <ConfigCard>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center'
            }}>
              <BackupIcon sx={{ mr: 1, color: '#3182ce' }} />
              Parâmetros de Backup
            </Typography>
            
            {/* Tipo de Dado */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tipo de Dado
              </Typography>
              <TextField
                select
                value={inputs.dataType}
                onChange={(e) => handleInputChange('dataType', e.target.value)}
                fullWidth
              >
                {Object.entries(DATA_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.name} | Compressão: {(value.compression * 100).toFixed(0)}% | Crescimento: {(value.growthRate * 100).toFixed(0)}%
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            {/* Tamanho Atual */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tamanho Atual (TB)
              </Typography>
              <TextField
                type="number"
                value={inputs.currentSize}
                onChange={(e) => handleInputChange('currentSize', parseFloat(e.target.value))}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">TB</InputAdornment>,
                }}
              />
            </FormControl>

            {/* Opção de Armazenamento */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Opção de Armazenamento
              </Typography>
              <TextField
                select
                value={inputs.storage}
                onChange={(e) => handleInputChange('storage', e.target.value)}
                fullWidth
              >
                {Object.entries(STORAGE_OPTIONS).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.name} | Velocidade: {value.speed.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            {/* Política de Retenção */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Política de Retenção
              </Typography>
              <TextField
                select
                value={inputs.retention}
                onChange={(e) => handleInputChange('retention', e.target.value)}
                fullWidth
              >
                {Object.entries(RETENTION_OPTIONS).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.name} | {value.days} dias
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            {/* Tipo de Backup */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tipo de Backup
              </Typography>
              <TextField
                select
                value={inputs.backupType}
                onChange={(e) => handleInputChange('backupType', e.target.value)}
                fullWidth
              >
                {Object.entries(BACKUP_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.name} | Frequência: {value.frequency} | Fator: {(value.sizeFactor * 100).toFixed(0)}%
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </ConfigCard>
          
          {/* Novo Card de Cenários de Disaster Recovery */}
          <ConfigCard>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center'
            }}>
              <VerifiedIcon sx={{ mr: 1, color: '#3182ce' }} />
              Cenários de Disaster Recovery
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
              Selecione o nível de proteção adequado para seus requisitos de negócio:
            </Typography>
            
            {DR_SCENARIOS.map((scenario) => (
              <DRScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={inputs.selectedDRScenario.id === scenario.id}
                onSelect={handleDRScenarioSelect}
              />
            ))}
            
            {inputs.selectedDRScenario && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#ebf8ff', borderRadius: '8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Cenário selecionado: <strong>{inputs.selectedDRScenario.name}</strong>
                </Typography>
                <Typography variant="body2">
                  <strong>RTO:</strong> {inputs.selectedDRScenario.rto} | <strong>RPO:</strong> {inputs.selectedDRScenario.rpo}
                </Typography>
                {results && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Impacto no Custo:</strong> {results.drAdjustedCost}
                  </Typography>
                )}
              </Box>
            )}
          </ConfigCard>
          
          {/* Configuração de Discos por Appliance */}
          <ConfigCard>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center'
            }}>
              <DiskIcon sx={{ mr: 1, color: '#3182ce' }} />
              Configuração de Discos
            </Typography>
            
            <DiskConfigurator
              title="Discos de Cache"
              diskType="CACHE"
              disks={inputs.cacheDisks}
              maxDisks={MAX_DISKS_PER_NODE}
              onDiskChange={(disk) => setInputs({...inputs, cacheDisks: [disk]})}
              onCountChange={(count) => setInputs({...inputs, cacheDisks: Array(count).fill(inputs.cacheDisks[0])})}
            />
            
            <DiskConfigurator
              title="Discos de Dados"
              diskType="DATA"
              disks={inputs.dataDisks}
              maxDisks={MAX_DISKS_PER_NODE}
              onDiskChange={(disk) => setInputs({...inputs, dataDisks: [disk]})}
              onCountChange={(count) => setInputs({...inputs, dataDisks: Array(count).fill(inputs.dataDisks[0])})}
            />
            
            {/* Overhead de Cache e Dados */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Overhead de Cache (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={inputs.cacheOverhead}
                onChange={(e) => setInputs({...inputs, cacheOverhead: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Overhead de Dados (%)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={inputs.dataOverhead}
                onChange={(e) => setInputs({...inputs, dataOverhead: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                variant="outlined"
              />
            </Box>
            
            {/* Número de Appliances */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Número de Appliances
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={inputs.manualAppliances}
                onChange={(e) => setInputs({...inputs, manualAppliances: Number(e.target.value)})}
                variant="outlined"
              />
            </Box>
          </ConfigCard>
        </Grid>
        
        {/* Painel de Resultados */}
        <Grid item xs={12} md={7}>
          <ConfigCard>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Visão Geral" />
                <Tab label="Projeção de Crescimento" />
                <Tab label="Detalhes Técnicos" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && results && (
              <>
                {/* Resumo da Necessidade */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ 
                    mb: 2,
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <TimelineIcon sx={{ mr: 1 }} />
                    Projeção de Armazenamento Necessário
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#3182ce">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Tamanho Projetado
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.projectedDataSizeTB} TB
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          Após {inputs.forecastYears} anos
                        </Typography>
                      </ResultCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#3182ce">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Custo Total
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.drAdjustedCost}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          Ajustado para {inputs.selectedDRScenario.name}
                        </Typography>
                      </ResultCard>
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#38a169">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Armazenamento Total
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#38a169', fontWeight: 700 }}>
                          {results.totalProtectedStorageTB} TB
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          Com fator de proteção {results.protectionFactor}x
                        </Typography>
                      </ResultCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#3182ce">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Appliances Necessárias
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.finalAppliances}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {results.calculatedAppliances} calculadas + {results.finalAppliances - results.calculatedAppliances} extras
                        </Typography>
                      </ResultCard>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
            
            {activeTab === 1 && results && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Simulação de Crescimento
                </Typography>
                
                <GrowthProjectionChart projections={results.growthProjections} />
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1">Detalhes da Projeção:</Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#edf2f7' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Ano</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Taxa de Crescimento</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Tamanho Projetado (TB)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Recomendação</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.growthProjections.map((proj) => (
                          <TableRow key={proj.year}>
                            <TableCell>{proj.year}</TableCell>
                            <TableCell>{proj.growthRate.toFixed(1)}%</TableCell>
                            <TableCell>{proj.projectedSize.toFixed(2)}</TableCell>
                            <TableCell>
                              {proj.growthRate > 30 ? (
                                <Chip label="Revisão Arquitetural" color="warning" size="small" />
                              ) : (
                                <Chip label="Plano Adequado" color="success" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detalhes Técnicos
                </Typography>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#edf2f7' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Parâmetro</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Tamanho Original</TableCell>
                        <TableCell>{inputs.originalDataSizeTB} TB</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Taxa de Mudança Diária</TableCell>
                        <TableCell>{inputs.dailyChangeRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dias de Retenção</TableCell>
                        <TableCell>{inputs.retentionDays}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Taxa de Compressão</TableCell>
                        <TableCell>{inputs.compressionRatio}x</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Taxa de Crescimento Anual</TableCell>
                        <TableCell>{inputs.annualGrowthRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Anos de Previsão</TableCell>
                        <TableCell>{inputs.forecastYears}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Proteção</TableCell>
                        <TableCell>{inputs.protectionLevel === 'standard' ? 'Padrão (2x)' : 'Alto (3x)'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Overhead de Cache</TableCell>
                        <TableCell>{inputs.cacheOverhead}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Overhead de Dados</TableCell>
                        <TableCell>{inputs.dataOverhead}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Número de Appliances</TableCell>
                        <TableCell>{inputs.manualAppliances}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cenário de DR</TableCell>
                        <TableCell>{inputs.selectedDRScenario.name}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </ConfigCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BackupSizingTool; 