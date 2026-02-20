/**
 * UPDATED EventDetailScreen.js - WITH NOISE SOURCE DETECTION
 * 
 * 🔥 NEW FEATURES:
 * - Source Detection Display (Neighbor vs Own Apartment)
 * - dBA/dBC Analysis Visualization  
 * - Motion Correlation Information
 * - Octave Band Analysis Display
 * - Enhanced Legal Relevance Scoring
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Button, ProgressBar, Chip, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const EventDetailScreen = ({ route, navigation }) => {
  const { event } = route.params;
  
  // Parse enhanced data (safely handle string/object)
  const sourceDetection = typeof event.source_detection === 'string' 
    ? JSON.parse(event.source_detection || '{}')
    : event.source_detection || {};
    
  const octaveBands = typeof event.octave_bands === 'string'
    ? JSON.parse(event.octave_bands || '{}') 
    : event.octave_bands || {};
    
  const dbaDbcData = typeof event.dba_dbc_data === 'string'
    ? JSON.parse(event.dba_dbc_data || '{}')
    : event.dba_dbc_data || {};
    
  const motionData = typeof event.motion_data === 'string'
    ? JSON.parse(event.motion_data || '{}')
    : event.motion_data || {};

  // Helper functions
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'NEIGHBOR': return { name: 'apartment', color: '#e74c3c' };
      case 'OWN_APARTMENT': return { name: 'home', color: '#2ecc71' };
      case 'UNCERTAIN': return { name: 'help-outline', color: '#f39c12' };
      default: return { name: 'volume-up', color: '#95a5a6' };
    }
  };

  const getLegalRelevanceColor = (relevance) => {
    switch (relevance) {
      case 'very_high': return '#c0392b';
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const renderFrequencyBar = (bandName, energy, maxEnergy) => {
    const percentage = maxEnergy > 0 ? (energy / maxEnergy) : 0;
    const height = Math.max(20, percentage * 100);
    
    let color = '#3498db'; // Default blue
    if (bandName.includes('bass')) color = '#e74c3c'; // Red for bass
    else if (bandName.includes('high')) color = '#2ecc71'; // Green for highs
    else color = '#f39c12'; // Orange for mids
    
    return (
      <View key={bandName} style={styles.freqBar}>
        <View 
          style={[
            styles.freqBarFill, 
            { height, backgroundColor: color }
          ]} 
        />
        <Text style={styles.freqBarLabel}>{bandName.replace('_', ' ')}</Text>
        <Text style={styles.freqBarValue}>{energy.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Main Event Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <MaterialIcons name="notification-important" size={24} color="#e74c3c" />
            <Text style={styles.title}>Lärmereignis Details</Text>
          </View>
          
          <Text style={styles.timestamp}>{formatTimestamp(event.timestamp)}</Text>
          <Text style={styles.decibel}>{event.decibel} dB</Text>
          <Text style={styles.classification}>{event.classification}</Text>
          
          {event.duration && (
            <Text style={styles.duration}>Dauer: {event.duration} Sekunden</Text>
          )}
        </Card.Content>
      </Card>

      {/* 🔥 NEW: Source Detection Card */}
      {sourceDetection.source && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <MaterialIcons 
                name={getSourceIcon(sourceDetection.source).name} 
                size={24} 
                color={getSourceIcon(sourceDetection.source).color} 
              />
              <Text style={styles.sectionTitle}>Lärmquelle Analyse</Text>
            </View>
            
            <View style={styles.sourceRow}>
              <Chip 
                mode="outlined" 
                style={[styles.sourceChip, { 
                  borderColor: getSourceIcon(sourceDetection.source).color 
                }]}
              >
                {sourceDetection.source === 'NEIGHBOR' ? 'Nachbar' : 
                 sourceDetection.source === 'OWN_APARTMENT' ? 'Eigene Wohnung' : 'Unbestimmt'}
              </Chip>
              
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Sicherheit</Text>
                <ProgressBar 
                  progress={sourceDetection.confidence || 0} 
                  style={styles.confidenceBar}
                  color={getSourceIcon(sourceDetection.source).color}
                />
                <Text style={styles.confidenceValue}>
                  {Math.round((sourceDetection.confidence || 0) * 100)}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.analysisReason}>
              {sourceDetection.reason || 'Keine Analyse verfügbar'}
            </Text>
            
            {/* Frequency Analysis Details */}
            {sourceDetection.analysis && (
              <View style={styles.frequencyAnalysis}>
                <Text style={styles.analysisTitle}>Frequenz-Analyse:</Text>
                <Text style={styles.analysisDetail}>
                  Bass-Anteil: {Math.round(sourceDetection.analysis.bassRatio * 100)}%
                </Text>
                <Text style={styles.analysisDetail}>
                  Höhen-Anteil: {Math.round(sourceDetection.analysis.highRatio * 100)}%
                </Text>
                <View style={styles.patternTags}>
                  {sourceDetection.analysis.isBassDominant && (
                    <Chip mode="outlined" style={styles.patternChip}>Bass-dominant</Chip>
                  )}
                  {sourceDetection.analysis.hasNoHighFreq && (
                    <Chip mode="outlined" style={styles.patternChip}>Höhen gedämpft</Chip>
                  )}
                  {sourceDetection.analysis.isMuffled && (
                    <Chip mode="outlined" style={styles.patternChip}>Gedämpft</Chip>
                  )}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* 🔥 NEW: dBA/dBC Analysis */}
      {dbaDbcData.dBA && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <MaterialIcons name="equalizer" size={24} color="#9b59b6" />
              <Text style={styles.sectionTitle}>dBA/dBC Analyse</Text>
            </View>
            
            <View style={styles.dbAnalysisRow}>
              <View style={styles.dbValue}>
                <Text style={styles.dbLabel}>dB(A)</Text>
                <Text style={styles.dbNumber}>{dbaDbcData.dBA}</Text>
              </View>
              <View style={styles.dbValue}>
                <Text style={styles.dbLabel}>dB(C)</Text>  
                <Text style={styles.dbNumber}>{dbaDbcData.dBC}</Text>
              </View>
              <View style={styles.dbValue}>
                <Text style={styles.dbLabel}>Differenz</Text>
                <Text style={[
                  styles.dbNumber, 
                  { color: dbaDbcData.difference > 8 ? '#e74c3c' : '#2ecc71' }
                ]}>
                  {dbaDbcData.difference > 0 ? '+' : ''}{dbaDbcData.difference}
                </Text>
              </View>
            </View>
            
            {dbaDbcData.difference > 8 && (
              <View style={styles.dbInterpretation}>
                <MaterialIcons name="info" size={16} color="#e74c3c" />
                <Text style={styles.dbInterpretationText}>
                  Hohe Differenz ({dbaDbcData.difference} dB) deutet auf Bass-dominanten Lärm hin - 
                  typisch für Nachbarschaftslärm durch Wände/Decken.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* 🔥 NEW: Octave Band Visualization */}
      {Object.keys(octaveBands).length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <MaterialIcons name="graphic-eq" size={24} color="#1abc9c" />
              <Text style={styles.sectionTitle}>Frequenz-Spektrum</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.frequencyBars}>
                {Object.entries(octaveBands).map(([bandName, band]) => {
                  const maxEnergy = Math.max(...Object.values(octaveBands).map(b => b.energy));
                  return renderFrequencyBar(bandName, band.energy, maxEnergy);
                })}
              </View>
            </ScrollView>
            
            <Text style={styles.frequencyNote}>
              Bass-dominante Spektren (rote Balken) deuten oft auf Nachbarschaftslärm hin.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* 🔥 NEW: Motion Correlation */}
      {motionData.correlation && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <MaterialIcons name="vibration" size={24} color="#ff6b6b" />
              <Text style={styles.sectionTitle}>Bewegungs-Korrelation</Text>
            </View>
            
            <View style={styles.motionRow}>
              <Text style={styles.motionType}>
                {motionData.correlation === 'FOOTSTEPS_ABOVE' ? '👟 Trittschall von oben' :
                 motionData.correlation === 'FURNITURE_MOVING' ? '🪑 Möbel bewegt' :
                 motionData.correlation === 'AUDIO_ONLY' ? '🔇 Keine Handy-Bewegung' : 
                 '📱 Schwache Korrelation'}
              </Text>
              
              <Text style={styles.motionConfidence}>
                Sicherheit: {Math.round((motionData.confidence || 0) * 100)}%
              </Text>
            </View>
            
            <Text style={styles.motionReason}>
              {motionData.reason || 'Keine Bewegungsanalyse verfügbar'}
            </Text>
            
            {motionData.details && (
              <View style={styles.motionDetails}>
                <Text style={styles.motionDetailText}>
                  Bewegungsereignisse: {motionData.details.significantEvents} von {motionData.details.totalEvents}
                </Text>
                <Text style={styles.motionDetailText}>
                  Max. Beschleunigung: {motionData.details.maxAcceleration} m/s²
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Legal Relevance */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <MaterialIcons name="gavel" size={24} color="#8e44ad" />
            <Text style={styles.sectionTitle}>Rechtliche Bewertung</Text>
          </View>
          
          <View style={styles.legalRelevanceRow}>
            <View style={[
              styles.legalRelevanceBadge,
              { backgroundColor: getLegalRelevanceColor(event.legal_relevance) }
            ]}>
              <Text style={styles.legalRelevanceText}>
                {event.legal_relevance === 'very_high' ? 'Sehr Hoch' :
                 event.legal_relevance === 'high' ? 'Hoch' :
                 event.legal_relevance === 'medium' ? 'Mittel' :
                 event.legal_relevance === 'low' ? 'Niedrig' : 'Minimal'}
              </Text>
            </View>
            
            {event.confidence_score && (
              <Text style={styles.confidenceScore}>
                Vertrauen: {event.confidence_score}%
              </Text>
            )}
          </View>
          
          <Text style={styles.legalExplanation}>
            Diese Bewertung basiert auf Lautstärke, Dauer, Frequenz-Analyse, 
            Bewegungskorrelation und Tageszeit.
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Zurück
        </Button>
        
        <Button 
          mode="contained" 
          onPress={() => {
            // Add to report functionality
            Alert.alert('Info', 'Zu Bericht hinzugefügt');
          }}
          style={styles.button}
        >
          Zu Bericht hinzufügen
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2c3e50',
  },
  timestamp: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  decibel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 8,
  },
  classification: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  
  // Source Detection Styles
  sourceRow: {
    marginTop: 8,
  },
  sourceChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  confidenceContainer: {
    marginVertical: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 8,
    marginVertical: 4,
  },
  confidenceValue: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'right',
  },
  analysisReason: {
    fontSize: 13,
    color: '#34495e',
    fontStyle: 'italic',
    marginTop: 8,
  },
  frequencyAnalysis: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  analysisDetail: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  patternTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  patternChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  
  // dBA/dBC Analysis Styles
  dbAnalysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dbValue: {
    alignItems: 'center',
  },
  dbLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  dbNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  dbInterpretation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 8,
  },
  dbInterpretationText: {
    flex: 1,
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 8,
  },
  
  // Frequency Bar Styles
  frequencyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 16,
    minWidth: 600,
  },
  freqBar: {
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 50,
  },
  freqBarFill: {
    width: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  freqBarLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 2,
  },
  freqBarValue: {
    fontSize: 9,
    color: '#95a5a6',
    textAlign: 'center',
  },
  frequencyNote: {
    fontSize: 11,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  
  // Motion Correlation Styles
  motionRow: {
    marginVertical: 8,
  },
  motionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  motionConfidence: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  motionReason: {
    fontSize: 13,
    color: '#34495e',
    fontStyle: 'italic',
    marginTop: 8,
  },
  motionDetails: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
  },
  motionDetailText: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  
  // Legal Relevance Styles
  legalRelevanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  legalRelevanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  legalRelevanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceScore: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  legalExplanation: {
    fontSize: 11,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  button: {
    flex: 0.45,
  },
});

export default EventDetailScreen;