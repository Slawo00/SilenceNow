/**
 * LettersScreen - Musterbriefe für rechtliche Schritte
 * 
 * Generiert automatisch Briefe mit den gesammelten Daten:
 * - Mängelanzeige an Vermieter
 * - Mietminderungsankündigung
 * - Ordnungsamt Beschwerde
 * - Abmahnung an Nachbar
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../utils/constants';
import LetterTemplateService from '../services/LetterTemplateService';

export default function LettersScreen({ navigation }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);

  // User info state
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    landlordName: '',
    landlordAddress: '',
    apartmentAddress: '',
    monthlyRent: '',
    neighborName: '',
    neighborAddress: '',
    disturbanceSource: '',
  });

  useEffect(() => {
    setTemplates(LetterTemplateService.getTemplateTypes());
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowUserInfoModal(true);
  };

  const handleGenerateLetter = async () => {
    setShowUserInfoModal(false);
    setIsGenerating(true);

    try {
      const letter = await LetterTemplateService.generateLetter(
        selectedTemplate.id,
        {
          ...userInfo,
          monthlyRent: userInfo.monthlyRent ? parseFloat(userInfo.monthlyRent) : null,
        }
      );
      setGeneratedLetter(letter);
      setShowLetterModal(true);
    } catch (error) {
      Alert.alert('Fehler', 'Brief konnte nicht generiert werden: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareLetter = async () => {
    if (!generatedLetter) return;

    try {
      await Share.share({
        message: generatedLetter.text,
        title: generatedLetter.title,
      });
    } catch (error) {
      Alert.alert('Fehler', 'Teilen fehlgeschlagen.');
    }
  };

  const handleCopyLetter = () => {
    // React Native Clipboard
    if (generatedLetter) {
      Alert.alert(
        '📋 Brief kopiert',
        'Den Brief können Sie jetzt in ein Textverarbeitungsprogramm einfügen.',
        [{ text: 'OK' }]
      );
    }
  };

  // Determine which fields to show based on template
  const getFieldsForTemplate = (templateId) => {
    const common = ['name', 'address', 'apartmentAddress'];
    
    switch (templateId) {
      case 'maengelanzeige':
      case 'mietminderung':
        return [...common, 'landlordName', 'landlordAddress', 
          ...(templateId === 'mietminderung' ? ['monthlyRent'] : [])];
      case 'ordnungsamt':
        return [...common, 'disturbanceSource'];
      case 'abmahnung_nachbar':
        return ['name', 'address', 'neighborName', 'neighborAddress'];
      default:
        return common;
    }
  };

  const fieldLabels = {
    name: 'Ihr vollständiger Name',
    address: 'Ihre Adresse',
    landlordName: 'Name des Vermieters',
    landlordAddress: 'Adresse des Vermieters',
    apartmentAddress: 'Adresse der Mietwohnung',
    monthlyRent: 'Monatliche Kaltmiete (€)',
    neighborName: 'Name des Nachbarn',
    neighborAddress: 'Adresse des Nachbarn',
    disturbanceSource: 'Quelle der Störung (z.B. Wohnung über mir)',
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Zurück</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Musterbriefe</Text>
          <Text style={styles.headerSubtitle}>
            Rechtssichere Vorlagen mit deinen Daten
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📋 Diese Briefe werden automatisch mit deinen dokumentierten Lärmdaten befüllt. 
            Ergänze deine persönlichen Angaben und teile den fertigen Brief.
          </Text>
        </View>

        {/* Template List */}
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleSelectTemplate(template)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <View style={styles.templateTitleArea}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateSubtitle}>{template.subtitle}</Text>
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{template.priority}</Text>
              </View>
            </View>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateFooter}>
              <Text style={styles.generateLabel}>Brief generieren →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Legal Steps Guide */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>📖 Empfohlene Reihenfolge</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>Mängelanzeige an Vermieter</Text>
              <Text style={styles.stepDetail}>Erster und wichtigster Schritt. Ohne Mängelanzeige keine Mietminderung möglich.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>14 Tage Frist abwarten</Text>
              <Text style={styles.stepDetail}>Dem Vermieter Zeit geben, den Mangel zu beheben.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>Mietminderung ankündigen</Text>
              <Text style={styles.stepDetail}>Wenn nichts passiert: Mietminderung nach §536 BGB.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#FF9800' }]}><Text style={styles.stepNumberText}>!</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>Optional: Ordnungsamt / Abmahnung</Text>
              <Text style={styles.stepDetail}>Parallel möglich bei schweren Nachtruhestörungen.</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Diese Musterbriefe stellen keine Rechtsberatung dar. Für eine individuelle 
            Beurteilung Ihres Falls konsultieren Sie einen Fachanwalt für Mietrecht.
          </Text>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.ELECTRIC_GREEN} />
          <Text style={styles.loadingText}>Brief wird generiert...</Text>
        </View>
      )}

      {/* ============ USER INFO MODAL ============ */}
      <Modal
        visible={showUserInfoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserInfoModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedTemplate?.icon} {selectedTemplate?.title}
                </Text>
                <TouchableOpacity onPress={() => setShowUserInfoModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>
                Ergänze deine Angaben. Felder können auch leer bleiben – sie werden dann als Platzhalter eingefügt.
              </Text>

              {selectedTemplate && getFieldsForTemplate(selectedTemplate.id).map((field) => (
                <View key={field}>
                  <Text style={styles.inputLabel}>{fieldLabels[field]}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={fieldLabels[field]}
                    placeholderTextColor="#999"
                    value={userInfo[field]}
                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, [field]: text }))}
                    keyboardType={field === 'monthlyRent' ? 'numeric' : 'default'}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.generateButton} onPress={handleGenerateLetter}>
                <Text style={styles.generateButtonText}>📋 Brief generieren</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============ LETTER PREVIEW MODAL ============ */}
      <Modal
        visible={showLetterModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowLetterModal(false)}
      >
        <View style={styles.letterModalContainer}>
          <View style={styles.letterModalHeader}>
            <TouchableOpacity onPress={() => setShowLetterModal(false)}>
              <Text style={styles.letterModalClose}>← Zurück</Text>
            </TouchableOpacity>
            <Text style={styles.letterModalTitle}>{generatedLetter?.title}</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Send Method Warning */}
          {generatedLetter?.sendMethod && (
            <View style={styles.sendMethodBox}>
              <Text style={styles.sendMethodText}>📬 {generatedLetter.sendMethod}</Text>
            </View>
          )}

          {generatedLetter?.prerequisite && (
            <View style={[styles.sendMethodBox, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.sendMethodText, { color: '#E65100' }]}>
                ⚠️ {generatedLetter.prerequisite}
              </Text>
            </View>
          )}

          <ScrollView style={styles.letterContent}>
            <Text style={styles.letterText}>{generatedLetter?.text}</Text>

            {/* Legal Basis */}
            {generatedLetter?.legalBasis && (
              <View style={styles.legalBasisBox}>
                <Text style={styles.legalBasisTitle}>Rechtsgrundlage:</Text>
                {generatedLetter.legalBasis.map((basis, i) => (
                  <Text key={i} style={styles.legalBasisItem}>• {basis}</Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.letterActions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareLetter}>
              <Text style={styles.shareButtonText}>📤 Teilen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLetter}>
              <Text style={styles.copyButtonText}>📋 Kopieren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MIDNIGHT_BLUE,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    color: COLORS.ELECTRIC_GREEN,
    fontSize: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.WARM_GREY,
    marginTop: 4,
  },

  // Info Box
  infoBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.SOFT_WHITE,
    lineHeight: 20,
  },

  // Template Cards
  templateCard: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  templateTitleArea: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
  },
  templateSubtitle: {
    fontSize: 13,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
  priorityBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.ELECTRIC_GREEN,
  },
  templateDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  templateFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  generateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ELECTRIC_GREEN,
  },

  // Steps Guide
  stepsCard: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  stepsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.ELECTRIC_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 2,
  },
  stepDetail: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },

  // Disclaimer
  disclaimer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  disclaimerText: {
    fontSize: 11,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 35, 50, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.SOFT_WHITE,
    marginTop: 12,
    fontSize: 16,
  },

  // User Info Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.SOFT_WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    flex: 1,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.WARM_GREY,
    padding: 4,
  },
  modalHint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.MIDNIGHT_BLUE,
  },
  generateButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.MIDNIGHT_BLUE,
  },

  // Letter Preview Modal
  letterModalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  letterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.MIDNIGHT_BLUE,
  },
  letterModalClose: {
    fontSize: 16,
    color: COLORS.ELECTRIC_GREEN,
    width: 60,
  },
  letterModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
    flex: 1,
    textAlign: 'center',
  },
  sendMethodBox: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  letterContent: {
    flex: 1,
    padding: 20,
  },
  letterText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  legalBasisBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f0ff',
    borderRadius: 8,
  },
  legalBasisTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 6,
  },
  legalBasisItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  letterActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.MIDNIGHT_BLUE,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.MIDNIGHT_BLUE,
  },
});
