import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, NOISE_CATEGORIES } from '../utils/constants';
import DatabaseService from '../services/DatabaseService';

const CATEGORY_OPTIONS = Object.values(NOISE_CATEGORIES);

export default function EventDetailScreen({ route, navigation }) {
  const { event: initialEvent } = route.params;
  const [event, setEvent] = useState(initialEvent);
  const [witnesses, setWitnesses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Witness form state
  const [witnessName, setWitnessName] = useState('');
  const [witnessContact, setWitnessContact] = useState('');
  const [witnessRelationship, setWitnessRelationship] = useState('');
  const [witnessStatement, setWitnessStatement] = useState('');

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('general');

  // Robust date parsing
  const parseTimestamp = (ts) => {
    if (!ts) return new Date();
    if (ts instanceof Date && !isNaN(ts.getTime())) return ts;
    const num = typeof ts === 'number' ? ts : Number(ts);
    if (!isNaN(num) && num > 0) {
      if (num > 1000000000000) return new Date(num);
      if (num > 1000000000) return new Date(num * 1000);
    }
    if (typeof ts === 'string') {
      const parsed = new Date(ts);
      if (!isNaN(parsed.getTime())) return parsed;
      const withT = ts.replace(' ', 'T');
      const parsed2 = new Date(withT);
      if (!isNaN(parsed2.getTime())) return parsed2;
    }
    return new Date();
  };

  // Start/End time
  const startTime = event.start_time || event.timestamp;
  const endTime = event.end_time;
  const startDate = parseTimestamp(startTime);
  const endDate = endTime ? parseTimestamp(endTime) : null;

  const startTimeStr = startDate.toLocaleTimeString('de-DE', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const endTimeStr = endDate
    ? endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;
  const dateString = startDate.toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  // Dauer berechnen
  let durationMin = 0;
  if (startDate && endDate) {
    durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  } else if (event.duration) {
    durationMin = Math.round(event.duration / 60);
  }

  const hour = startDate.getHours();
  const isNighttime = hour >= 22 || hour < 6;
  const isEvening = hour >= 19 || hour < 7;

  // Kategorie
  const noiseCategory = event.noise_category;
  const categoryObj = noiseCategory
    ? CATEGORY_OPTIONS.find(c => c.key === noiseCategory)
    : null;

  // AI / Classification data
  const aiEmoji = categoryObj?.emoji || event.aiEmoji || event.ai_emoji || getDefaultEmoji(event.classification);
  const aiType = categoryObj?.label || event.aiType || event.ai_type || event.classification || 'Unbekannt';
  const aiConfidence = event.aiConfidence || event.ai_confidence || 0;
  const aiDescription = event.aiDescription || event.ai_description || '';
  const aiLegalCategory = event.aiLegalCategory || event.ai_legal_category || '';
  const aiSeverity = event.aiSeverity || event.ai_severity || 'medium';

  // Nachbar-Status
  const neighborScore = event.neighbor_score || 0;
  const sourceConfirmed = event.source_confirmed || 'unconfirmed';

  // Frequency data
  const freqBass = event.freq_bass || event.freqBands?.bass || 0;
  const freqLowMid = event.freq_low_mid || event.freqBands?.lowMid || 0;
  const freqMid = event.freq_mid || event.freqBands?.mid || 0;
  const freqHighMid = event.freq_high_mid || event.freqBands?.highMid || 0;
  const freqHigh = event.freq_high || event.freqBands?.high || 0;
  const maxFreq = Math.max(freqBass, freqLowMid, freqMid, freqHighMid, freqHigh, 1);

  const legalScore = event.legal_score || event.legalScore || 0;
  const displayDecibel = Math.round(event.avg_decibel || event.decibel || 0);
  const peakDecibel = Math.round(event.peak_decibel || event.decibel || 0);

  useEffect(() => {
    loadWitnessesAndNotes();
  }, []);

  const loadWitnessesAndNotes = async () => {
    if (event.id) {
      const [w, n] = await Promise.all([
        DatabaseService.getWitnesses(event.id),
        DatabaseService.getNotes(event.id),
      ]);
      setWitnesses(w);
      setNotes(n);
    }
  };

  // ============ CATEGORY CHANGE ============

  const handleCategoryChange = async (category) => {
    setShowCategoryDropdown(false);
    if (!event.id) return;

    try {
      await DatabaseService.updateEvent(event.id, {
        noise_category: category.key,
        category_auto: 0,
      });
      setEvent(prev => ({
        ...prev,
        noise_category: category.key,
        category_auto: false,
      }));
      Alert.alert('✅ Kategorie geändert', `Kategorie auf "${category.emoji} ${category.label}" gesetzt.`);
    } catch (error) {
      Alert.alert('Fehler', 'Kategorie konnte nicht geändert werden.');
    }
  };

  // ============ NEIGHBOR CONFIRMATION ============

  const handleConfirmNeighbor = async () => {
    if (!event.id) return;
    try {
      await DatabaseService.updateEvent(event.id, { source_confirmed: 'neighbor' });
      setEvent(prev => ({ ...prev, source_confirmed: 'neighbor' }));
      Alert.alert('🏠 Bestätigt', 'Event als Nachbar-Lärm bestätigt.');
    } catch (error) {
      Alert.alert('Fehler', 'Konnte nicht bestätigt werden.');
    }
  };

  const handleDenyNeighbor = async () => {
    if (!event.id) return;
    try {
      await DatabaseService.updateEvent(event.id, { source_confirmed: 'not_neighbor' });
      setEvent(prev => ({ ...prev, source_confirmed: 'not_neighbor' }));
      Alert.alert('✖ Kein Nachbar', 'Event als "Kein Nachbar" markiert.');
    } catch (error) {
      Alert.alert('Fehler', 'Konnte nicht geändert werden.');
    }
  };

  // ============ DELETE EVENT ============

  const handleDeleteEvent = () => {
    Alert.alert(
      '⚠️ Event löschen',
      'Dieses Lärm-Event wirklich unwiderruflich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            if (!event.id) return;
            try {
              await DatabaseService.deleteEvent(event.id);
              Alert.alert('🗑️ Gelöscht', 'Event wurde gelöscht.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Fehler', 'Event konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  // ============ WITNESS FUNCTIONS ============

  const handleAddWitness = async () => {
    if (!witnessName.trim()) {
      Alert.alert('Fehler', 'Bitte gib den Namen des Zeugen ein.');
      return;
    }
    const result = await DatabaseService.addWitness(event.id, {
      name: witnessName.trim(),
      contact: witnessContact.trim() || null,
      relationship: witnessRelationship.trim() || null,
      statement: witnessStatement.trim() || null,
    });
    if (result) {
      setShowWitnessModal(false);
      setWitnessName(''); setWitnessContact(''); setWitnessRelationship(''); setWitnessStatement('');
      await loadWitnessesAndNotes();
      Alert.alert('✅ Zeuge hinzugefügt', `${witnessName} wurde als Zeuge dokumentiert.`);
    } else {
      Alert.alert('Fehler', 'Zeuge konnte nicht gespeichert werden.');
    }
  };

  const handleDeleteWitness = (witness) => {
    Alert.alert('Zeuge entfernen', `"${witness.witness_name}" wirklich entfernen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen', style: 'destructive',
        onPress: async () => {
          await DatabaseService.deleteWitness(witness.id);
          await loadWitnessesAndNotes();
        },
      },
    ]);
  };

  // ============ NOTE FUNCTIONS ============

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Notiz ein.');
      return;
    }
    const result = await DatabaseService.addNote(event.id, {
      text: noteText.trim(),
      type: noteType,
    });
    if (result) {
      setShowNoteModal(false);
      setNoteText(''); setNoteType('general');
      await loadWitnessesAndNotes();
      Alert.alert('✅ Notiz gespeichert', 'Deine Notiz wurde zum Ereignis hinzugefügt.');
    } else {
      Alert.alert('Fehler', 'Notiz konnte nicht gespeichert werden.');
    }
  };

  const handleDeleteNote = (note) => {
    Alert.alert('Notiz entfernen', 'Diese Notiz wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen', style: 'destructive',
        onPress: async () => {
          await DatabaseService.deleteNote(note.id);
          await loadWitnessesAndNotes();
        },
      },
    ]);
  };

  function getDefaultEmoji(classification) {
    if (!classification) return '🔊';
    if (classification.includes('Music') || classification.includes('Musik')) return '🎵';
    if (classification.includes('Very Loud') || classification.includes('Stark')) return '📢';
    if (classification.includes('Stimmen') || classification.includes('Voice')) return '🗣️';
    if (classification.includes('Bau') || classification.includes('Hammer')) return '🔨';
    if (classification.includes('Maschine') || classification.includes('Brumm')) return '⚙️';
    return '🔊';
  }

  function getSeverityColor(severity) {
    switch (severity) {
      case 'high': return '#E53935';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.WARM_GREY;
    }
  }

  function getSeverityLabel(severity) {
    switch (severity) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Gering';
      default: return 'Unbekannt';
    }
  }

  function getSourceLabel(source) {
    switch (source) {
      case 'neighbor': return '🏠 Nachbar (bestätigt)';
      case 'not_neighbor': return '✖ Kein Nachbar';
      case 'unconfirmed': return '❓ Unbestätigt';
      default: return '❓ Unbekannt';
    }
  }

  const noteTypeLabels = {
    general: '📝 Allgemein',
    observation: '👁️ Beobachtung',
    impact: '💥 Auswirkung',
    action: '⚡ Maßnahme',
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Zurück</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Event Details</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Main Classification Card */}
        <View style={styles.card}>
          <Text style={styles.emojiLarge}>{aiEmoji}</Text>

          {/* Kategorie mit Dropdown */}
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.classification}>{aiType}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <View style={styles.dropdown}>
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.dropdownItem,
                    noiseCategory === cat.key && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleCategoryChange(cat)}
                >
                  <Text style={styles.dropdownItemText}>
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {event.category_auto === false || event.category_auto === 0 ? (
            <Text style={styles.manualBadge}>✏️ Manuell geändert</Text>
          ) : null}

          {aiConfidence > 0 && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>KI-Konfidenz: {aiConfidence}%</Text>
            </View>
          )}

          <Text style={styles.datetime}>{dateString}</Text>

          {/* Start - End Time Display */}
          <Text style={styles.timeRange}>
            {startTimeStr}{endTimeStr ? ` — ${endTimeStr}` : ''}
          </Text>
          {durationMin > 0 && (
            <Text style={styles.durationText}>Dauer: {durationMin} Min</Text>
          )}

          {isNighttime && (
            <View style={styles.nightBadge}>
              <Text style={styles.nightBadgeText}>🌙 Nachtruhe (22-06 Uhr)</Text>
            </View>
          )}
        </View>

        {/* Nachbar-Erkennung Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Nachbar-Erkennung</Text>
          <DataRow label="Nachbar-Score" value={`${neighborScore}/100`} highlight={neighborScore > 60} />
          <DataRow label="Status" value={getSourceLabel(event.source_confirmed || sourceConfirmed)} />

          <View style={styles.neighborActions}>
            <TouchableOpacity
              style={[
                styles.neighborBtn,
                (event.source_confirmed || sourceConfirmed) === 'neighbor' && styles.neighborBtnActive,
              ]}
              onPress={handleConfirmNeighbor}
            >
              <Text style={styles.neighborBtnText}>🏠 Nachbar bestätigen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.neighborBtn,
                styles.neighborBtnDeny,
                (event.source_confirmed || sourceConfirmed) === 'not_neighbor' && styles.neighborBtnDenyActive,
              ]}
              onPress={handleDenyNeighbor}
            >
              <Text style={styles.neighborBtnText}>✖ Kein Nachbar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Analysis Card */}
        {aiDescription ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 KI-Analyse</Text>
            <Text style={styles.aiDescription}>{aiDescription}</Text>
            <View style={styles.aiGrid}>
              <View style={styles.aiGridItem}>
                <Text style={styles.aiGridLabel}>Kategorie</Text>
                <Text style={styles.aiGridValue}>
                  {aiLegalCategory ? aiLegalCategory.replace(/_/g, ' ') : '-'}
                </Text>
              </View>
              <View style={styles.aiGridItem}>
                <Text style={styles.aiGridLabel}>Schwere</Text>
                <Text style={[styles.aiGridValue, { color: getSeverityColor(aiSeverity) }]}>
                  {getSeverityLabel(aiSeverity)}
                </Text>
              </View>
              <View style={styles.aiGridItem}>
                <Text style={styles.aiGridLabel}>Konfidenz</Text>
                <Text style={styles.aiGridValue}>{aiConfidence}%</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Measurement Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Messdaten</Text>
          <DataRow label="Ø Dezibel" value={`${displayDecibel} dB`} highlight={displayDecibel > 75} />
          <DataRow label="Spitze" value={`${peakDecibel} dB`} highlight={peakDecibel > 80} />
          <DataRow
            label="Dauer"
            value={durationMin > 0 ? `${durationMin} Min` : (event.duration ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s` : 'N/A')}
          />
          <DataRow
            label="Intensität"
            value={displayDecibel >= 85 ? 'Extrem' : displayDecibel >= 75 ? 'Sehr hoch' : displayDecibel >= 60 ? 'Hoch' : 'Mäßig'}
            highlight={displayDecibel >= 75}
          />
          <DataRow
            label="Tageszeit"
            value={isNighttime ? '🌙 Nachtruhe' : isEvening ? '🌆 Abend' : '☀️ Tag'}
          />
          {legalScore > 0 && (
            <DataRow label="Legal Score" value={`${legalScore}/100`} highlight={legalScore > 60} />
          )}
        </View>

        {/* Frequency Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ Frequenz-Profil</Text>
          {maxFreq > 0 ? (
            <>
              <FrequencyBar label="Bass" value={freqBass} max={maxFreq} color="#E53935" />
              <FrequencyBar label="Low-Mid" value={freqLowMid} max={maxFreq} color="#FF9800" />
              <FrequencyBar label="Mid" value={freqMid} max={maxFreq} color="#4CAF50" />
              <FrequencyBar label="High-Mid" value={freqHighMid} max={maxFreq} color="#2196F3" />
              <FrequencyBar label="High" value={freqHigh} max={maxFreq} color="#9C27B0" />
            </>
          ) : (
            <Text style={styles.noDataText}>Keine Frequenzdaten verfügbar</Text>
          )}
        </View>

        {/* Legal Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Rechtliche Einordnung</Text>
          <View style={[styles.legalBox, isNighttime && styles.legalBoxNight]}>
            <Text style={styles.legalText}>
              {isNighttime
                ? `🔴 Nachtruhestörung (${startTimeStr}): Während der gesetzlichen Nachtruhe (22:00-06:00). Wiegt rechtlich besonders schwer.`
                : `Aufgezeichnet um ${startTimeStr} Uhr.`}
            </Text>
            <Text style={[styles.legalText, { marginTop: 8 }]}>
              {displayDecibel >= 55
                ? `✅ ${displayDecibel} dB liegt ÜBER dem Schwellenwert von 55 dB. Mietminderung nach §536 BGB kann begründet sein.`
                : `Messwert von ${displayDecibel} dB liegt unter dem Schwellenwert.`}
            </Text>
          </View>
        </View>

        {/* Witnesses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Zeugen ({witnesses.length})</Text>
          {witnesses.length === 0 ? (
            <Text style={styles.emptyHint}>Keine Zeugen dokumentiert.</Text>
          ) : (
            witnesses.map((w) => (
              <TouchableOpacity key={w.id} style={styles.witnessCard} onLongPress={() => handleDeleteWitness(w)}>
                <View style={styles.witnessHeader}>
                  <Text style={styles.witnessName}>👤 {w.witness_name}</Text>
                  {w.witness_relationship && <Text style={styles.witnessRelation}>{w.witness_relationship}</Text>}
                </View>
                {w.witness_contact && <Text style={styles.witnessContact}>📱 {w.witness_contact}</Text>}
                {w.statement && <Text style={styles.witnessStatement}>„{w.statement}"</Text>}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notizen ({notes.length})</Text>
          {notes.length === 0 ? (
            <Text style={styles.emptyHint}>Keine Notizen vorhanden.</Text>
          ) : (
            notes.map((n) => (
              <TouchableOpacity key={n.id} style={styles.noteCard} onLongPress={() => handleDeleteNote(n)}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteType}>{noteTypeLabels[n.note_type] || '📝 Allgemein'}</Text>
                  <Text style={styles.noteDate}>{new Date(n.created_at).toLocaleDateString('de-DE')}</Text>
                </View>
                <Text style={styles.noteText}>{n.note_text}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowWitnessModal(true)}>
            <Text style={styles.actionButtonText}>👤 Zeuge hinzufügen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowNoteModal(true)}>
            <Text style={styles.actionButtonText}>📝 Notiz hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Event Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
          <Text style={styles.deleteButtonText}>🗑️ Event löschen</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ============ WITNESS MODAL ============ */}
      <Modal
        visible={showWitnessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWitnessModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👤 Zeuge hinzufügen</Text>
                <TouchableOpacity onPress={() => setShowWitnessModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput style={styles.input} placeholder="Vor- und Nachname" placeholderTextColor="#999" value={witnessName} onChangeText={setWitnessName} />
                <Text style={styles.inputLabel}>Kontakt (optional)</Text>
                <TextInput style={styles.input} placeholder="Telefon oder E-Mail" placeholderTextColor="#999" value={witnessContact} onChangeText={setWitnessContact} />
                <Text style={styles.inputLabel}>Beziehung (optional)</Text>
                <TextInput style={styles.input} placeholder="z.B. Nachbar, Partner" placeholderTextColor="#999" value={witnessRelationship} onChangeText={setWitnessRelationship} />
                <Text style={styles.inputLabel}>Aussage (optional)</Text>
                <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Was hat der Zeuge beobachtet?" placeholderTextColor="#999" value={witnessStatement} onChangeText={setWitnessStatement} multiline numberOfLines={3} />
                <TouchableOpacity style={styles.modalButton} onPress={handleAddWitness}>
                  <Text style={styles.modalButtonText}>Zeuge speichern</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============ NOTE MODAL ============ */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📝 Notiz hinzufügen</Text>
                <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.inputLabel}>Kategorie</Text>
                <View style={styles.typeSelector}>
                  {Object.entries(noteTypeLabels).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.typeChip, noteType === key && styles.typeChipActive]}
                      onPress={() => setNoteType(key)}
                    >
                      <Text style={[styles.typeChipText, noteType === key && styles.typeChipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Notiz *</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline, { height: 120 }]}
                  placeholder="z.B. Laute Musik vom Nachbarn über mir..."
                  placeholderTextColor="#999"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline numberOfLines={5}
                />
                <TouchableOpacity style={styles.modalButton} onPress={handleAddNote}>
                  <Text style={styles.modalButtonText}>Notiz speichern</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const DataRow = ({ label, value, highlight = false }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={[styles.dataValue, highlight && styles.dataValueHighlight]}>{value}</Text>
  </View>
);

const FrequencyBar = ({ label, value, max, color }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={styles.freqRow}>
      <Text style={styles.freqLabel}>{label}</Text>
      <View style={styles.freqBarContainer}>
        <View style={[styles.freqBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.freqValue}>{Math.round(value * 10) / 10}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.MIDNIGHT_BLUE },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  backButton: { fontSize: 18, color: COLORS.ELECTRIC_GREEN, width: 60 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.SOFT_WHITE },
  card: {
    backgroundColor: COLORS.SOFT_WHITE, marginHorizontal: 20, marginBottom: 20,
    borderRadius: 12, padding: 24, alignItems: 'center',
  },
  emojiLarge: { fontSize: 64, marginBottom: 12 },
  categorySelector: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)',
  },
  classification: { fontSize: 24, fontWeight: 'bold', color: COLORS.MIDNIGHT_BLUE, textAlign: 'center' },
  dropdownArrow: { fontSize: 14, color: COLORS.WARM_GREY },
  dropdown: {
    width: '100%', marginTop: 8, backgroundColor: '#fff',
    borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden',
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemActive: { backgroundColor: 'rgba(0, 230, 118, 0.15)' },
  dropdownItemText: { fontSize: 16, color: COLORS.MIDNIGHT_BLUE },
  manualBadge: { fontSize: 12, color: COLORS.WARNING_AMBER, marginTop: 4 },
  confidenceBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 8, marginBottom: 8,
  },
  confidenceText: { fontSize: 12, color: COLORS.ELECTRIC_GREEN, fontWeight: '600' },
  datetime: { fontSize: 14, color: COLORS.WARM_GREY, marginBottom: 4, marginTop: 8 },
  timeRange: { fontSize: 20, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE },
  durationText: { fontSize: 14, color: COLORS.WARM_GREY, marginTop: 4 },
  nightBadge: { backgroundColor: '#E53935', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  nightBadgeText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  // Nachbar Actions
  neighborActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  neighborBtn: {
    flex: 1, backgroundColor: 'rgba(0, 230, 118, 0.15)', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.ELECTRIC_GREEN,
  },
  neighborBtnActive: { backgroundColor: COLORS.ELECTRIC_GREEN },
  neighborBtnDeny: { backgroundColor: 'rgba(229, 57, 53, 0.1)', borderColor: '#E53935' },
  neighborBtnDenyActive: { backgroundColor: '#E53935' },
  neighborBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE },

  // Sections
  section: { backgroundColor: COLORS.SOFT_WHITE, marginHorizontal: 20, marginBottom: 16, borderRadius: 12, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE, marginBottom: 16 },
  aiDescription: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
  aiGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  aiGridItem: { alignItems: 'center' },
  aiGridLabel: { fontSize: 11, color: COLORS.WARM_GREY, marginBottom: 4 },
  aiGridValue: { fontSize: 14, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE, textTransform: 'capitalize' },

  // Data Rows
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dataLabel: { fontSize: 14, color: COLORS.WARM_GREY },
  dataValue: { fontSize: 14, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE },
  dataValueHighlight: { color: '#E53935' },

  // Frequency
  freqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  freqLabel: { fontSize: 13, color: COLORS.WARM_GREY, width: 65 },
  freqBarContainer: { flex: 1, height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  freqBar: { height: '100%', borderRadius: 6 },
  freqValue: { fontSize: 13, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE, width: 45, textAlign: 'right' },
  noDataText: { fontSize: 14, color: COLORS.WARM_GREY, fontStyle: 'italic' },

  // Legal
  legalBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)', borderRadius: 8, padding: 16,
    borderWidth: 1, borderColor: COLORS.ELECTRIC_GREEN,
  },
  legalBoxNight: { backgroundColor: 'rgba(229, 57, 53, 0.1)', borderColor: '#E53935' },
  legalText: { fontSize: 13, color: COLORS.MIDNIGHT_BLUE, lineHeight: 20 },

  // Witnesses
  emptyHint: { fontSize: 13, color: COLORS.WARM_GREY, fontStyle: 'italic', lineHeight: 18 },
  witnessCard: {
    backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: COLORS.ELECTRIC_GREEN,
  },
  witnessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  witnessName: { fontSize: 15, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE },
  witnessRelation: {
    fontSize: 12, color: COLORS.WARM_GREY, backgroundColor: '#e8e8e8',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  witnessContact: { fontSize: 12, color: '#555', marginTop: 2 },
  witnessStatement: { fontSize: 13, color: '#444', fontStyle: 'italic', marginTop: 6, lineHeight: 18 },

  // Notes
  noteCard: {
    backgroundColor: '#FFFDE7', borderRadius: 8, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: '#FFC107',
  },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  noteType: { fontSize: 12, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE },
  noteDate: { fontSize: 11, color: COLORS.WARM_GREY },
  noteText: { fontSize: 14, color: '#333', lineHeight: 20 },

  // Footer Actions
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 12 },
  actionButton: {
    flex: 1, backgroundColor: COLORS.ELECTRIC_GREEN, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  actionButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.MIDNIGHT_BLUE },

  // Delete
  deleteButton: {
    marginHorizontal: 20, backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#E53935',
  },
  deleteButtonText: { fontSize: 14, fontWeight: '700', color: '#E53935' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: {
    backgroundColor: COLORS.SOFT_WHITE, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 20, maxHeight: '90%',
  },
  modalScrollContent: { paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.MIDNIGHT_BLUE },
  modalClose: { fontSize: 24, color: COLORS.WARM_GREY, padding: 4 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.MIDNIGHT_BLUE, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.MIDNIGHT_BLUE,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#eee', borderWidth: 1, borderColor: '#ddd',
  },
  typeChipActive: { backgroundColor: COLORS.ELECTRIC_GREEN, borderColor: COLORS.ELECTRIC_GREEN },
  typeChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  typeChipTextActive: { color: COLORS.MIDNIGHT_BLUE, fontWeight: '700' },
  modalButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  modalButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.MIDNIGHT_BLUE },
});
