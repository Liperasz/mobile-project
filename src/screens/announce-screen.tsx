import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    photoUri:  string | null;
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
        photoUri:  null,
    });

    // stado para controlar a abertura da lista de categorias
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        setForm({ category: '', weightKg: '', description: '', photoUri: null });
    };

    // funções para câmera e galeria
    const handleTakeImage = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
            Alert.alert('Permissão negada', 'O aplicativo precisa de permissão para acessar a câmera.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            update('photoUri', result.assets[0].uri);
        }
    };

    const handlePickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('Permissão negada', 'O aplicativo precisa de permissão para acessar a galeria.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            update('photoUri', result.assets[0].uri);
        }
    };

    const handlePhotoOptions = () => {
        Alert.alert(
            "Adicionar Foto",
            "Escolha como deseja adicionar a foto do resíduo",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Tirar Foto", onPress: handleTakeImage },
                { text: "Escolher da Galeria", onPress: handlePickImage },
            ]
        );
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

                {/* seleção de categoria */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    CATEGORIA DO RESÍDUO
                </Text>
                
                {/* componente de seleção de um item (famosa caixinha de seleção) */}
                <View style={styles.dropdownWrapper}>
                    <Pressable
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={[
                            styles.dropdownHeader,
                            { 
                                backgroundColor: colors.surface, 
                                borderColor: categoryError ? '#ef4444' : colors.border 
                            }
                        ]}
                    >
                        <Text style={{ color: form.category ? colors.text : colors.textMuted }}>
                            {form.category || '(nenhuma categoria selecionada)'}
                        </Text>
                        <Text style={{ color: colors.primary }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                    </Pressable>

                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {CATEGORIES.map(cat => (
                                <Pressable
                                    key={cat}
                                    onPress={() => {
                                        update('category', cat);
                                        setCategoryError('');
                                        setIsDropdownOpen(false);
                                    }}
                                    style={({ pressed }) => [
                                        styles.dropdownItem,
                                        { backgroundColor: pressed ? colors.primaryLight : 'transparent' }
                                    ]}
                                >
                                    <Text style={{ color: colors.text }}>{cat}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
                {/*  Erro caso nenhuma categoria esteja selecionada */}
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
                {form.photoUri ? (
                    <View style={styles.photoContainer}>
                        <Image source={{ uri: form.photoUri }} style={styles.imagePreview} />
                        <Pressable style={[styles.btnSecondary, { borderColor: colors.border }]} onPress={() => update('photoUri', null)}>
                            <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>🗑️ Remover Foto</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={handlePhotoOptions}
                        style={({ pressed }) => [
                            styles.photoPressable,
                            {
                                borderColor: colors.primary,
                                backgroundColor: pressed ? colors.primaryLight : 'transparent',
                                transform: [{ scale: pressed ? 0.98 : 1 }],
                            },
                        ]}
                    >
                        <Text style={styles.photoIcon}>📷</Text>
                        <Text style={[styles.photoLabel, { color: colors.primary }]}>
                            Adicionar Foto
                        </Text>
                    </Pressable>
                )}

                {/* botão de envio */}
                <Button
                    label="Anunciar Resíduo"
                    onPress={handleSubmit}
                    style={styles.submitBtn}
                />

            </ScrollView>

            {/* alerta de sucesso de envio*/}
            {showSuccessAlert && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={styles.alertWrapper}>
                        <AlertBox
                            title="Sucesso!"
                            message={`Anúncio de ${form.category} (${form.weightKg}kg) criado com sucesso!`}
                            variant="success"
                            onClose={handleAlertClose}
                        />
                    </View>
                </View>
            )}

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
    dropdownWrapper: {
        zIndex: 10, 
        marginBottom: 4,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 14,
    },
    dropdownList: {
        marginTop: 4,
        borderWidth: 1.5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
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
    photoContainer: {
        gap: 12,
    },
    imagePreview: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1.5,
    },
    btnSecondaryText: {
        fontWeight: '700',
        fontSize: 15,
    },
    photoActions: {
        flexDirection: 'row',
        gap: 10,
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
    // overlay é para sobrepor o resto dos quando o alerta for acionado
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        padding: 20,
    },
    alertWrapper: {
        width: '100%',
    }
});