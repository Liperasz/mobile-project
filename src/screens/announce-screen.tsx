import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AlertBox from '../components/alert-box';
import Button from '../components/button';
import { useTheme } from '../context/theme-context';

// tipos de lixos
type WasteCategory = 'Plástico' | 'Vidro' | 'Papel' | 'Metal' | 'Eletrônico' | 'Orgânico' | '';

// informações do formulário de preenchimento
type FormState = {
    category:    WasteCategory;
    weightKg:    string;
    description: string;
    photoTaken:  boolean;
};

// categorias disponíveis para seleção
const CATEGORIES: Exclude<WasteCategory, ''>[] = [
    'Plástico', 'Vidro', 'Papel', 'Metal', 'Eletrônico', 'Orgânico',
];

export default function AnnounceScreen() {

    // cores do tema
    const { colors } = useTheme();

    // estado do formulário
    const [form, setForm] = useState<FormState>({
        category:    '',
        weightKg:    '',
        description: '',
        photoTaken:  false,
    });

    // erros de validação
    const [categoryError, setCategoryError] = useState('');
    const [weightError, setWeightError] = useState('');

    // controle do alerta de sucesso
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // função para atualizar campos do formulário
    const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: val }));
    };

    // lida com o envio do anúncio
    const handleSubmit = () => {

        let isValid = true;

        if (!form.category) {
            setCategoryError('Selecione uma categoria.');
            isValid = false;
        } else {
            setCategoryError('');
        }

        if (!form.weightKg.trim()) {
            setWeightError('Informe o peso estimado.');
            isValid = false;
        } else {
            setWeightError('');
        }

        if (isValid) {
            setShowSuccessAlert(true);
        }
    };

    // reinicia o formulário após fechar o alerta
    const handleAlertClose = () => {
        setShowSuccessAlert(false);
        setForm({ category: '', weightKg: '', description: '', photoTaken: false });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header da tela */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    Anunciar Resíduo
                </Text>
            </View>

            {/* conteúdo com scroll */}
            <ScrollView contentContainerStyle={styles.content}>

                {/* alerta de sucesso — exibido após envio */}
                {showSuccessAlert && (
                    <AlertBox
                        title="Sucesso!"
                        message={`Anúncio de ${form.category} (${form.weightKg}kg) criado com sucesso!`}
                        variant="success"
                        onClose={handleAlertClose}
                    />
                )}

                {/* seleção de categoria */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    CATEGORIA DO RESÍDUO
                </Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map(cat => (
                        <Pressable
                            key={cat}
                            onPress={() => {
                                update('category', cat);
                                setCategoryError('');
                            }}
                            style={({ pressed }) => [
                                styles.catBtn,
                                {
                                    backgroundColor: form.category === cat
                                        ? colors.primary
                                        : colors.surface,
                                    borderColor: form.category === cat
                                        ? colors.primary
                                        : colors.border,
                                    opacity: pressed ? 0.75 : 1,
                                    transform: [{ scale: pressed ? 0.96 : 1 }],
                                },
                            ]}
                        >
                            <Text style={[styles.catBtnText, { color: form.category === cat ? '#fff' : colors.text }]}>
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                {/* erro de categoria */}
                {categoryError ? (
                    <Text style={styles.errorText}>{categoryError}</Text>
                ) : null}

                {/* peso estimado */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    PESO ESTIMADO (KG)
                </Text>
                <TextInput
                    value={form.weightKg}
                    onChangeText={t => {
                        update('weightKg', t);
                        setWeightError('');
                    }}
                    keyboardType="numeric"
                    placeholder="Ex: 2.5"
                    placeholderTextColor={colors.textMuted}
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.surface,
                            borderColor: weightError ? '#ef4444' : colors.border,
                            color: colors.text,
                        },
                    ]}
                />
                {/* erro de peso */}
                {weightError ? (
                    <Text style={styles.errorText}>{weightError}</Text>
                ) : null}

                {/* descrição opcional */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    DESCRIÇÃO (OPCIONAL)
                </Text>
                <TextInput
                    value={form.description}
                    onChangeText={t => update('description', t)}
                    placeholder="Estado do material, observações..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    style={[
                        styles.textarea,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                />

                {/* foto do resíduo */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    FOTO DO RESÍDUO
                </Text>
                {form.photoTaken ? (
                    <View style={[styles.photoPreview, { backgroundColor: colors.primaryLight }]}>
                        {/* Refatorado: fontWeight movido para o StyleSheet */}
                        <Text style={[styles.photoPreviewText, { color: colors.primary }]}>
                            📸 Foto capturada (simulada)
                        </Text>
                    </View>
                ) : (
                    <Pressable
                        onPress={() => update('photoTaken', true)}
                        style={({ pressed }) => [
                            styles.photoPressable,
                            {
                                borderColor: colors.primary,
                                backgroundColor: pressed ? colors.primaryLight : 'transparent',
                                transform: [{ scale: pressed ? 0.98 : 1 }],
                            },
                        ]}
                    >
                        {/* Refatorado: fontSize movido para o StyleSheet */}
                        <Text style={styles.photoIcon}>📷</Text>
                        <Text style={[styles.photoLabel, { color: colors.primary }]}>
                            Simular Captura de Foto
                        </Text>
                    </Pressable>
                )}

                {/* botão de envio */}
                <Button
                    label="Anunciar Resíduo"
                    onPress={handleSubmit}
                    /* Refatorado: estilo estático passado para o StyleSheet */
                    style={styles.submitBtn}
                />

            </ScrollView>
        </View>
    );
}

// estilização
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  catBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 4,
  },
  textarea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 90,
  },
  photoPressable: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  photoPreview: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  photoPreviewText: {
    fontWeight: '600',
  },
  photoIcon: {
    fontSize: 28,
  },
  photoLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: {
    marginTop: 24,
  },
});