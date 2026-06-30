import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import AlertBox from '../components/alert-box';
import Button from '../components/button';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';
import { useAnnouncements } from '../hooks/use-announcements';

type WasteCategory = 'Plástico' | 'Vidro' | 'Papel' | 'Metal' | 'Eletrônico' | 'Orgânico' | '';

type FormState = {
    category:    WasteCategory;
    weightKg:    string;
    description: string;
    photoUri:    string | null;
};

type Coords = { latitude: number; longitude: number };

const CATEGORIES: Exclude<WasteCategory, ''>[] = [
    'Plástico', 'Vidro', 'Papel', 'Metal', 'Eletrônico', 'Orgânico',
];

// Região padrão — centro do Brasil (caso GPS falhe)
const DEFAULT_REGION: Region = {
    latitude:       -15.7801,
    longitude:      -47.9292,
    latitudeDelta:  0.01,
    longitudeDelta: 0.01,
};

export default function AnnounceScreen() {

    const { colors } = useTheme();
    const { user } = useAuth();
    const { addAnnouncement } = useAnnouncements(user?.id ?? null);

    // Estado do formulário
    const [form, setForm] = useState<FormState>({
        category:    '',
        weightKg:    '',
        description: '',
        photoUri:    null,
    });

    // UI
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categoryError, setCategoryError]   = useState('');
    const [weightError, setWeightError]       = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Picker de mapa
    const [showMapPicker, setShowMapPicker]     = useState(false);
    const [mapRegion, setMapRegion]             = useState<Region>(DEFAULT_REGION);
    const [pinCoords, setPinCoords]             = useState<Coords | null>(null);
    const [isLocating, setIsLocating]           = useState(false);
    const [confirmedCoords, setConfirmedCoords] = useState<Coords | null>(null);
    const [confirmedAddress, setConfirmedAddress] = useState<string>('');
    const mapRef = useRef<MapView>(null);

    const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: val }));
    };

    // ── Validação do formulário ──────────────────────────────────────────────

    const validateForm = (): boolean => {
        let isValid = true;

        if (!form.category) {
            setCategoryError('Selecione uma categoria.');
            isValid = false;
        } else { setCategoryError(''); }

        if (!form.weightKg.trim()) {
            setWeightError('Informe o peso estimado.');
            isValid = false;
        } else { setWeightError(''); }

        return isValid;
    };

    // ── Abre o mapa picker após validar o formulário ─────────────────────────

    const handleOpenMapPicker = async () => {
        if (!validateForm()) return;

        setIsLocating(true);
        setShowMapPicker(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const coords = {
                    latitude:  location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                const region: Region = {
                    ...coords,
                    latitudeDelta:  0.005,
                    longitudeDelta: 0.005,
                };
                setMapRegion(region);
                setPinCoords(coords);
                mapRef.current?.animateToRegion(region, 600);
            }
        } catch {
            // Mantém região padrão
        } finally {
            setIsLocating(false);
        }
    };

    // ── Quando o usuário arrasta o mapa, move o pin para o centro ────────────

    const handleRegionChangeComplete = (region: Region) => {
        setMapRegion(region);
        setPinCoords({
            latitude:  region.latitude,
            longitude: region.longitude,
        });
    };

    // ── Confirma a localização selecionada e salva o anúncio ─────────────────

    const handleConfirmLocation = async () => {
        if (!pinCoords) {
            // Sem GPS — salva sem localização
            await doSave(null, '');
            return;
        }

        setIsSaving(true);
        let address = '';
        try {
            const results = await Location.reverseGeocodeAsync(pinCoords);
            if (results.length > 0) {
                const r = results[0];
                address = [r.street, r.district, r.city, r.region]
                    .filter(Boolean).join(', ');
            }
        } catch { /* silencia erro de geocoding */ }

        setConfirmedCoords(pinCoords);
        setConfirmedAddress(address);
        setShowMapPicker(false);
        await doSave(pinCoords, address);
    };

    // ── Salva o anúncio no banco ─────────────────────────────────────────────

    const doSave = async (coords: Coords | null, address: string) => {
        setIsSaving(true);
        try {
            await addAnnouncement({
                userId:      user!.id,
                userName:    user!.name,
                category:    form.category,
                weightKg:    parseFloat(form.weightKg.replace(',', '.')),
                description: form.description || undefined,
                photoUri:    form.photoUri || undefined,
                latitude:    coords?.latitude,
                longitude:   coords?.longitude,
                address:     address || undefined,
            });
            setShowSuccessAlert(true);
        } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao salvar anúncio.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAlertClose = () => {
        setShowSuccessAlert(false);
        setConfirmedCoords(null);
        setConfirmedAddress('');
        setForm({ category: '', weightKg: '', description: '', photoUri: null });
    };

    // ── Câmera ───────────────────────────────────────────────────────────────

    const handleTakeImage = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
            Alert.alert('Permissão negada', 'O app precisa de permissão para acessar a câmera.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            update('photoUri', result.assets[0].uri);
        }
    };

    const handlePickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('Permissão negada', 'O app precisa de permissão para acessar a galeria.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            update('photoUri', result.assets[0].uri);
        }
    };

    const handlePhotoOptions = () => {
        Alert.alert(
            'Adicionar Foto',
            'Escolha como deseja adicionar a foto do resíduo',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Tirar Foto', onPress: handleTakeImage },
                { text: 'Escolher da Galeria', onPress: handlePickImage },
            ]
        );
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    Anunciar Resíduo
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Localização confirmada (após picker) */}
                {confirmedCoords && (
                    <View style={[styles.locationConfirmed, {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                    }]}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <View style={styles.locationInfo}>
                            <Text style={[styles.locationTitle, { color: colors.primaryDark }]}>
                                Localização selecionada
                            </Text>
                            {confirmedAddress ? (
                                <Text style={[styles.locationAddr, { color: colors.text }]}>
                                    {confirmedAddress}
                                </Text>
                            ) : (
                                <Text style={[styles.locationAddr, { color: colors.textMuted }]}>
                                    {confirmedCoords.latitude.toFixed(5)}, {confirmedCoords.longitude.toFixed(5)}
                                </Text>
                            )}
                        </View>
                        <Pressable onPress={() => { setConfirmedCoords(null); setConfirmedAddress(''); }}>
                            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Alterar</Text>
                        </Pressable>
                    </View>
                )}

                {/* Categoria */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    CATEGORIA DO RESÍDUO
                </Text>
                <View style={styles.dropdownWrapper}>
                    <Pressable
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={[styles.dropdownHeader, {
                            backgroundColor: colors.surface,
                            borderColor: categoryError ? '#ef4444' : colors.border,
                        }]}
                    >
                        <Text style={{ color: form.category ? colors.text : colors.textMuted }}>
                            {form.category || '(nenhuma categoria selecionada)'}
                        </Text>
                        <Text style={{ color: colors.primary }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                    </Pressable>

                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {CATEGORIES.map((cat) => (
                                <Pressable
                                    key={cat}
                                    onPress={() => { update('category', cat); setCategoryError(''); setIsDropdownOpen(false); }}
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
                {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}

                {/* Peso */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    PESO ESTIMADO (KG)
                </Text>
                <TextInput
                    value={form.weightKg}
                    onChangeText={(t) => { update('weightKg', t); setWeightError(''); }}
                    keyboardType="numeric"
                    placeholder="Ex: 2.5"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, {
                        backgroundColor: colors.surface,
                        borderColor: weightError ? '#ef4444' : colors.border,
                        color: colors.text,
                    }]}
                />
                {weightError ? <Text style={styles.errorText}>{weightError}</Text> : null}

                {/* Descrição */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    DESCRIÇÃO (OPCIONAL)
                </Text>
                <TextInput
                    value={form.description}
                    onChangeText={(t) => update('description', t)}
                    placeholder="Estado do material, observações..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    style={[styles.textarea, {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                    }]}
                />

                {/* Foto */}
                <Text style={[styles.label, { color: colors.textMuted }]}>
                    FOTO DO RESÍDUO
                </Text>
                {form.photoUri ? (
                    <View style={styles.photoContainer}>
                        <Image source={{ uri: form.photoUri }} style={styles.imagePreview} />
                        <Pressable
                            style={[styles.btnSecondary, { borderColor: colors.border }]}
                            onPress={() => update('photoUri', null)}
                        >
                            <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>
                                🗑️ Remover Foto
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={handlePhotoOptions}
                        style={({ pressed }) => [styles.photoPressable, {
                            borderColor: colors.primary,
                            backgroundColor: pressed ? colors.primaryLight : 'transparent',
                        }]}
                    >
                        <Text style={styles.photoIcon}>📷</Text>
                        <Text style={[styles.photoLabel, { color: colors.primary }]}>
                            Adicionar Foto
                        </Text>
                    </Pressable>
                )}

                {/* Botão de envio — abre o mapa picker */}
                <Button
                    label={isSaving ? 'Salvando...' : 'Anunciar Resíduo'}
                    onPress={handleOpenMapPicker}
                    style={styles.submitBtn}
                />

            </ScrollView>

            {/* Alerta de sucesso */}
            {showSuccessAlert && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={styles.alertWrapper}>
                        <AlertBox
                            title="Anúncio publicado!"
                            message={`Seu anúncio de ${form.category} foi salvo com sucesso.`}
                            variant="success"
                            onClose={handleAlertClose}
                        />
                    </View>
                </View>
            )}
            </KeyboardAvoidingView>

            {/* ── Modal do Mapa Picker ─────────────────────────────────────── */}
            <Modal
                visible={showMapPicker}
                animationType="slide"
                onRequestClose={() => setShowMapPicker(false)}
            >
                <SafeAreaView style={[styles.mapModal, { backgroundColor: colors.background }]}>

                    {/* Header do modal */}
                    <View style={[styles.mapHeader, { borderBottomColor: colors.border }]}>
                        <Pressable onPress={() => setShowMapPicker(false)} style={styles.mapBackBtn}>
                            <Text style={[styles.mapBackText, { color: colors.primary }]}>✕ Cancelar</Text>
                        </Pressable>
                        <Text style={[styles.mapTitle, { color: colors.primaryDark }]}>
                            Confirme sua localização
                        </Text>
                        <View style={{ width: 80 }} />
                    </View>

                    {/* Instrução */}
                    <View style={[styles.mapInstruction, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.mapInstructionText, { color: colors.text }]}>
                            {isLocating
                                ? '⏳ Obtendo sua localização...'
                                : '🗺️ Mova o mapa para ajustar o pin ao local exato do resíduo'}
                        </Text>
                    </View>

                    {/* Mapa */}
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={mapRegion}
                            onRegionChangeComplete={handleRegionChangeComplete}
                            showsUserLocation
                            showsMyLocationButton
                        >
                            {pinCoords && (
                                <Marker
                                    coordinate={pinCoords}
                                    title="Local do resíduo"
                                    description="Arraste o mapa para ajustar"
                                    pinColor={colors.primary}
                                />
                            )}
                        </MapView>

                        {/* Pin fixo no centro (alternativa visual quando não há GPS) */}
                        {!pinCoords && (
                            <View style={styles.centerPin} pointerEvents="none">
                                <Text style={styles.centerPinText}>📍</Text>
                            </View>
                        )}
                    </View>

                    {/* Coordenadas atuais */}
                    {pinCoords && (
                        <View style={[styles.coordsBar, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.coordsText, { color: colors.textMuted }]}>
                                {pinCoords.latitude.toFixed(5)}, {pinCoords.longitude.toFixed(5)}
                            </Text>
                        </View>
                    )}

                    {/* Botão de confirmação */}
                    <View style={styles.mapFooter}>
                        <Button
                            label={isSaving ? 'Salvando...' : '✅ Confirmar e Publicar'}
                            onPress={handleConfirmLocation}
                        />
                        <Pressable
                            style={styles.skipLocationBtn}
                            onPress={() => { setShowMapPicker(false); doSave(null, ''); }}
                        >
                            <Text style={[styles.skipLocationText, { color: colors.textMuted }]}>
                                Publicar sem localização
                            </Text>
                        </Pressable>
                    </View>

                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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

    // Localização confirmada
    locationConfirmed: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 4,
    },
    locationIcon: { fontSize: 22 },
    locationInfo: { flex: 1 },
    locationTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    locationAddr: {
        fontSize: 12,
        marginTop: 2,
    },

    // Formulário
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
    photoContainer: { gap: 12 },
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
    photoIcon: { fontSize: 28 },
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
    submitBtn: { marginTop: 24 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        padding: 20,
    },
    alertWrapper: { width: '100%' },

    // Modal do mapa
    mapModal: {
        flex: 1,
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    mapBackBtn: {
        width: 80,
    },
    mapBackText: {
        fontSize: 14,
        fontWeight: '600',
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    mapInstruction: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    mapInstructionText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    centerPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -16,
        marginTop: -32,
    },
    centerPinText: { fontSize: 32 },
    coordsBar: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    coordsText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    mapFooter: {
        padding: 16,
        gap: 10,
    },
    skipLocationBtn: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    skipLocationText: {
        fontSize: 13,
    },
});