import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Paper, Divider,
  Slider, InputAdornment, FormControl, RadioGroup,
  FormControlLabel, Radio, Button, LinearProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, IconButton, MenuItem
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
  Remove as RemoveIcon
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
    manualAppliances: 3
  });

  const [resourceUsage, setResourceUsage] = useState({
    cpu: 65,
    memory: 70,
    disk: 85
  });

  const [results, setResults] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    calculateRequirements();
  }, [inputs]);

  const calculateRequirements = () => {
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
      manualAppliances
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
      storageUtilization: ((totalProtectedStorageTB / (totalApplianceCapacityTB * finalAppliances)) * 100).toFixed(1)
    });
  };

  const handleCacheDiskChange = (disk) => {
    setInputs({
      ...inputs,
      cacheDisks: Array(inputs.cacheDisks.length).fill(disk)
    });
  };

  const handleDataDiskChange = (disk) => {
    setInputs({
      ...inputs,
      dataDisks: Array(inputs.dataDisks.length).fill(disk)
    });
  };

  const handleCacheCountChange = (count) => {
    const currentDisk = inputs.cacheDisks[0] || DISK_TYPES.CACHE[0];
    const newCacheCount = Math.min(count, MAX_DISKS_PER_NODE - inputs.dataDisks.length);
    setInputs({
      ...inputs,
      cacheDisks: Array(newCacheCount).fill(currentDisk)
    });
  };

  const handleDataCountChange = (count) => {
    const currentDisk = inputs.dataDisks[0] || DISK_TYPES.DATA[0];
    const newDataCount = Math.min(count, MAX_DISKS_PER_NODE - inputs.cacheDisks.length);
    setInputs({
      ...inputs,
      dataDisks: Array(newDataCount).fill(currentDisk)
    });
  };

  // Para alterar o título no browser, você precisará também modificar:
  // 1. O arquivo public/index.html (título e meta tags)
  // 2. O arquivo src/index.js (document.title)

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <Typography variant="h4" sx={{ 
        mb: 4,
        fontWeight: 700,
        color: '#1a365d',
        display: 'flex',
        alignItems: 'center'
      }}>
        <StorageIcon sx={{ mr: 2, color: '#3182ce' }} />
        InfiniSizing Backup
      </Typography>
      
      <Typography variant="subtitle2" sx={{ mb: 3, color: '#4a5568', fontStyle: 'italic' }}>
        Desenvolvido por Cesaar Virno
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
            
            {/* Tamanho Original dos Dados */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Tamanho Original dos Dados (TB)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={inputs.originalDataSizeTB}
                onChange={(e) => setInputs({...inputs, originalDataSizeTB: Number(e.target.value)})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">TB</InputAdornment>,
                }}
                variant="outlined"
              />
            </Box>
            
            {/* Taxa de Mudança Diária */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Taxa de Mudança Diária (%)
              </Typography>
              <Slider
                value={inputs.dailyChangeRate}
                onChange={(_, val) => setInputs({...inputs, dailyChangeRate: val})}
                min={1}
                max={50}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: '1%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' }
                ]}
                sx={{ color: '#3182ce' }}
              />
            </Box>
            
            {/* Período de Retenção */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Período de Retenção (dias)
              </Typography>
              <Slider
                value={inputs.retentionDays}
                onChange={(_, val) => setInputs({...inputs, retentionDays: val})}
                min={1}
                max={365}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 7, label: '7d' },
                  { value: 30, label: '30d' },
                  { value: 365, label: '1a' }
                ]}
                sx={{ color: '#3182ce' }}
              />
            </Box>
            
            {/* Taxa de Compressão */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Taxa de Compressão
              </Typography>
              <Slider
                value={inputs.compressionRatio}
                onChange={(_, val) => setInputs({...inputs, compressionRatio: val})}
                min={1}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: '1x' },
                  { value: 5, label: '5x' },
                  { value: 10, label: '10x' }
                ]}
                sx={{ color: '#3182ce' }}
              />
            </Box>
            
            {/* Taxa de Crescimento Anual */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Taxa de Crescimento Anual (%)
              </Typography>
              <Slider
                value={inputs.annualGrowthRate}
                onChange={(_, val) => setInputs({...inputs, annualGrowthRate: val})}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
                sx={{ color: '#3182ce' }}
              />
            </Box>
            
            {/* Período de Projeção */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Período de Projeção (anos)
              </Typography>
              <Slider
                value={inputs.forecastYears}
                onChange={(_, val) => setInputs({...inputs, forecastYears: val})}
                min={1}
                max={5}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: '1a' },
                  { value: 3, label: '3a' },
                  { value: 5, label: '5a' }
                ]}
                sx={{ color: '#3182ce' }}
              />
            </Box>
            
            {/* Nível de Proteção */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Nível de Proteção
              </Typography>
              <RadioGroup
                row
                value={inputs.protectionLevel}
                onChange={(e) => setInputs({...inputs, protectionLevel: e.target.value})}
              >
                <FormControlLabel
                  value="standard"
                  control={<Radio color="primary" />}
                  label="Padrão (2x redundância)"
                />
                <FormControlLabel
                  value="high"
                  control={<Radio color="primary" />}
                  label="Alta (3x redundância)"
                />
              </RadioGroup>
            </Box>
          </ConfigCard>
          
          {/* Configuração de Discos por Appliance */}
          <ConfigCard>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center'
            }}>
              <NodeIcon sx={{ mr: 1, color: '#3182ce' }} />
              Configuração por Appliance
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 2,
              color: '#4a5568',
              fontStyle: 'italic'
            }}>
              Total de discos por appliance: {inputs.cacheDisks.length + inputs.dataDisks.length}/{MAX_DISKS_PER_NODE}
            </Typography>
            
            {/* Discos de Cache */}
            <DiskConfigurator
              title="Discos de Cache (SSD)"
              diskType="CACHE"
              disks={inputs.cacheDisks}
              maxDisks={MAX_DISKS_PER_NODE - inputs.dataDisks.length}
              onDiskChange={handleCacheDiskChange}
              onCountChange={handleCacheCountChange}
            />
            
            {/* Configuração de Overhead para Cache */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Overhead para Cache (%)
                <Tooltip title="Percentual de capacidade reservada para operações do sistema em discos de cache">
                  <InfoIcon sx={{ fontSize: '1rem', ml: 1, color: '#718096' }} />
                </Tooltip>
              </Typography>
              <Slider
                value={inputs.cacheOverhead}
                onChange={(_, val) => setInputs({...inputs, cacheOverhead: val})}
                min={0}
                max={20}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => `${val}%`}
                sx={{ color: '#4fc3f7' }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Discos de Dados */}
            <DiskConfigurator
              title="Discos de Dados (HDD)"
              diskType="DATA"
              disks={inputs.dataDisks}
              maxDisks={MAX_DISKS_PER_NODE - inputs.cacheDisks.length}
              onDiskChange={handleDataDiskChange}
              onCountChange={handleDataCountChange}
            />
            
            {/* Configuração de Overhead para Dados */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ color: '#4a5568', mb: 1 }}>
                Overhead para Dados (%)
                <Tooltip title="Percentual de capacidade reservada para operações do sistema em discos de dados">
                  <InfoIcon sx={{ fontSize: '1rem', ml: 1, color: '#718096' }} />
                </Tooltip>
              </Typography>
              <Slider
                value={inputs.dataOverhead}
                onChange={(_, val) => setInputs({...inputs, dataOverhead: val})}
                min={0}
                max={20}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => `${val}%`}
                sx={{ color: '#66bb6a' }}
              />
            </Box>
            
            {/* Configuração Manual de Appliances - CORRIGIDA */}
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="text" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ color: '#3182ce', mb: 1 }}
              >
                {showAdvanced ? 'Ocultar' : 'Mostrar'} configurações avançadas
              </Button>
              
              {showAdvanced && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#edf2f7', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                    Configuração Manual de Appliances
                    <Tooltip title="Defina manualmente o número mínimo de appliances">
                      <InfoIcon sx={{ fontSize: '1rem', ml: 1, color: '#718096' }} />
                    </Tooltip>
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton 
                      onClick={() => setInputs(prev => ({
                        ...prev,
                        manualAppliances: Math.max(1, prev.manualAppliances - 1)
                      }))}
                      disabled={inputs.manualAppliances <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      type="number"
                      value={inputs.manualAppliances}
                      onChange={(e) => {
                        const value = Math.max(1, parseInt(e.target.value) || 1);
                        setInputs(prev => ({
                          ...prev,
                          manualAppliances: value
                        }));
                      }}
                      variant="outlined"
                      sx={{ width: '80px' }}
                    />
                    <IconButton 
                      onClick={() => setInputs(prev => ({
                        ...prev,
                        manualAppliances: prev.manualAppliances + 1
                      }))}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          </ConfigCard>
        </Grid>
        
        {/* Painel de Resultados */}
        <Grid item xs={12} md={7}>
          <ConfigCard>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center'
            }}>
              <AssessmentIcon sx={{ mr: 1, color: '#3182ce' }} />
              Resultados do Dimensionamento
            </Typography>
            
            {results ? (
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
                          Dados Projetados ({inputs.forecastYears} anos)
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.projectedDataSizeTB} TB
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {inputs.annualGrowthRate}% de crescimento anual
                        </Typography>
                      </ResultCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#3182ce">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Backup Diário Necessário
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.dailyBackupSizeTB} TB
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {inputs.compressionRatio}x de compressão aplicada
                        </Typography>
                      </ResultCard>
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#3182ce">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Armazenamento Total
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.backupStorageTB} TB
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {inputs.retentionDays} dias de retenção
                        </Typography>
                      </ResultCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#3182ce">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Armazenamento Protegido
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#3182ce', fontWeight: 700 }}>
                          {results.totalProtectedStorageTB} TB
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          Redundância {results.protectionFactor}x
                        </Typography>
                      </ResultCard>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Configuração por Appliance */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ 
                    mb: 2,
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <NodeIcon sx={{ mr: 1 }} />
                    Capacidade por Appliance
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#edf2f7' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Capacidade Bruta (TB)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Overhead</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Capacidade Líquida (TB)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inputs.cacheDisks.length > 0 && (
                          <TableRow>
                            <TableCell>Cache</TableCell>
                            <TableCell>{inputs.cacheDisks[0].name}</TableCell>
                            <TableCell>{inputs.cacheDisks.length}</TableCell>
                            <TableCell>{(inputs.cacheDisks.length * inputs.cacheDisks[0].size / 1000).toFixed(2)}</TableCell>
                            <TableCell>{inputs.cacheOverhead}%</TableCell>
                            <TableCell>{results.perAppliance.cacheCapacityTB}</TableCell>
                          </TableRow>
                        )}
                        {inputs.dataDisks.length > 0 && (
                          <TableRow>
                            <TableCell>Dados</TableCell>
                            <TableCell>{inputs.dataDisks[0].name}</TableCell>
                            <TableCell>{inputs.dataDisks.length}</TableCell>
                            <TableCell>{(inputs.dataDisks.length * inputs.dataDisks[0].size / 1000).toFixed(2)}</TableCell>
                            <TableCell>{inputs.dataOverhead}%</TableCell>
                            <TableCell>{results.perAppliance.dataCapacityTB}</TableCell>
                          </TableRow>
                        )}
                        <TableRow sx={{ backgroundColor: '#f7fafc' }}>
                          <TableCell colSpan={3} sx={{ fontWeight: 600 }}>Total por Appliance</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {(
                              (inputs.cacheDisks.length * (inputs.cacheDisks[0]?.size || 0) + 
                              (inputs.dataDisks.length * (inputs.dataDisks[0]?.size || 0))
                            ) / 1000).toFixed(2)} TB
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{results.perAppliance.totalCapacityTB} TB</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                
                {/* Recomendação de Cluster */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ 
                    mb: 2,
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <NodeIcon sx={{ mr: 1 }} />
                    Infraestrutura Recomendada
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <ResultCard color="#38a169">
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Appliances Configurados
                        </Typography>
                        <Typography variant="h3" sx={{ color: '#38a169', fontWeight: 800 }}>
                          {results.finalAppliances}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {results.calculatedAppliances < results.finalAppliances ? (
                            `(Calculado: ${results.calculatedAppliances}, ajustado manualmente)`
                          ) : (
                            `(Calculado: ${results.calculatedAppliances})`
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568', mt: 1 }}>
                          Capacidade total: {(results.finalAppliances * results.perAppliance.totalCapacityTB).toFixed(2)} TB
                        </Typography>
                      </ResultCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ResultCard color={results.throughputSufficient ? '#38a169' : '#e53e3e'}>
                        <Typography variant="subtitle2" sx={{ color: '#4a5568', mb: 1 }}>
                          Throughput do Cluster
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          color: results.throughputSufficient ? '#38a169' : '#e53e3e',
                          fontWeight: 700
                        }}>
                          {results.clusterThroughputTBh} TB/h
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: results.throughputSufficient ? '#718096' : '#e53e3e',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {results.throughputSufficient ? (
                            <>Atende ao requisito diário de {results.requiredDailyThroughputTB} TB</>
                          ) : (
                            <>
                              <WarningIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                              Não atende ao requisito diário de {results.requiredDailyThroughputTB} TB
                            </>
                          )}
                        </Typography>
                      </ResultCard>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ 
                    backgroundColor: '#f0fff4',
                    borderRadius: '8px',
                    p: 2,
                    mb: 2,
                    borderLeft: '4px solid #38a169'
                  }}>
                    <Typography variant="body2" sx={{ color: '#2f855a' }}>
                      Utilização de armazenamento: {results.storageUtilization}% da capacidade total
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={results.storageUtilization}
                      sx={{ 
                        height: 10,
                        borderRadius: 5,
                        mt: 1,
                        backgroundColor: '#c6f6d5',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#38a169',
                          borderRadius: 5
                        }
                      }}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: '#a0aec0'
              }}>
                <StorageIcon sx={{ fontSize: '3rem', mb: 2, color: '#cbd5e0' }} />
                <Typography>Configure os parâmetros para calcular o dimensionamento</Typography>
              </Box>
            )}
          </ConfigCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BackupSizingTool; 