import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Linking,
    ListRenderItemInfo,
    Platform,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import Card from '../components/card';
import { useTheme } from '../context/theme-context';

// tipos
type WasteType = 'Plástico' | 'Vidro' | 'Papel' | 'Metal' | 'Eletrônico' | 'Orgânico';

type Ecopoint = {
    id: string;
    name: string;
    address: string;
    types: WasteType[];
    icon: string;
    lat: number;
    lng: number;
};

// dados dos ecopontos (estáticos — suficiente para o projeto)
const ECOPOINTS: Ecopoint[] = [
    {
        id: 'e1', name: 'Coop Verde Sul', icon: '♻️',
        address: 'Rua das Acácias, 234 — Bom Retiro',
        types: ['Plástico', 'Vidro', 'Papel'], lat: -23.525, lng: -46.625,
    },
    {
        id: 'e2', name: 'EcoPonto Central', icon: '🔋',
        address: 'Av. Paulista, 1001 — Bela Vista',
        types: ['Eletrônico', 'Metal', 'Plástico'], lat: -23.561, lng: -46.655,
    },
    {
        id: 'e3', name: 'Recicla Fácil', icon: '🌿',
        address: 'R. Augusta, 78 — Consolação',
        types: ['Papel', 'Plástico', 'Orgânico'], lat: -23.553, lng: -46.658,
    },
    {
        id: 'e4', name: 'CoopMais Itaim', icon: '🔧',
        address: 'Al. Franca, 450 — Itaim Bibi',
        types: ['Vidro', 'Metal', 'Eletrônico'], lat: -23.577, lng: -46.675,
    },
];

// cores dos chips de tipo
const CHIP_COLORS: Record<WasteType, { bg: string; text: string }> = {
    Plástico:   { bg: '#dbeafe', text: '#1e40af' },
    Vidro:      { bg: '#fce7f3', text: '#9d174d' },
    Orgânico:   { bg: '#dcfce7', text: '#166534' },
    Eletrônico: { bg: '#fef3c7', text: '#92400e' },
    Papel:      { bg: '#ede9fe', text: '#4c1d95' },
    Metal:      { bg: '#fee2e2', text: '#991b1b' },
};

// agrupa os ecopontos por tipo de resíduo (para SectionList)
function groupByType(ecopoints: Ecopoint[]) {
    const map: Record<string, Ecopoint[]> = {};
    for (const ep of ecopoints) {
        for (const type of ep.types) {
            if (!map[type]) map[type] = [];
            if (!map[type].find((e) => e.id === ep.id)) map[type].push(ep);
        }
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([title, data]) => ({ title, data }));
}

// componente
export default function EcopointsScreen() {

    const { colors } = useTheme();
    const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isGpsLoading, setIsGpsLoading] = useState(false);
    const [gpsAddress, setGpsAddress] = useState<string>('');

    const sections = groupByType(ECOPOINTS);

    // obtém localização do usuário via GPS
    const handleGetMyLocation = async () => {
        setIsGpsLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Habilite a localização nas configurações do dispositivo.');
                return;
            }
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const coords = { lat: location.coords.latitude, lng: location.coords.longitude };
            setMyLocation(coords);

            // Reverse geocoding
            const results = await Location.reverseGeocodeAsync({
                latitude: coords.lat,
                longitude: coords.lng,
            });
            if (results.length > 0) {
                const r = results[0];
                setGpsAddress([r.street, r.district, r.city].filter(Boolean).join(', '));
            }
        } catch {
            Alert.alert('Erro', 'Não foi possível obter a localização.');
        } finally {
            setIsGpsLoading(false);
        }
    };

    // abre o Maps nativo com as coordenadas do ecoponto
    const openInMaps = (ep: Ecopoint) => {
        const label = encodeURIComponent(ep.name);
        const url = Platform.OS === 'ios'
            ? `maps://app?ll=${ep.lat},${ep.lng}&q=${label}`
            : `geo:${ep.lat},${ep.lng}?q=${ep.lat},${ep.lng}(${label})`;
        Linking.openURL(url).catch(() =>
            Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas.')
        );
    };

    const renderEcocard = ({ item }: ListRenderItemInfo<Ecopoint>) => (
        <Card>
            <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.ecoName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.ecoAddress, { color: colors.textMuted }]}>{item.address}</Text>
                    <View style={styles.chips}>
                        {item.types.map((t) => (
                            <View key={t} style={[styles.chip, { backgroundColor: CHIP_COLORS[t].bg }]}>
                                <Text style={[styles.chipTxt, { color: CHIP_COLORS[t].text }]}>{t}</Text>
                            </View>
                        ))}
                    </View>
                    <Pressable
                        onPress={() => openInMaps(item)}
                        style={[styles.mapsBtn, { borderColor: colors.primary }]}
                    >
                        <Text style={[styles.mapsBtnText, { color: colors.primary }]}>
                            🗺️ Ver no Maps
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    Ecopontos
                </Text>
            </View>

            {/* Card de localização do usuário */}
            <View style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {myLocation ? (
                    <View style={styles.locationInfo}>
                        <Text style={[styles.locationTitle, { color: colors.text }]}>
                            📍 Minha localização
                        </Text>
                        {gpsAddress ? (
                            <Text style={[styles.locationAddr, { color: colors.textMuted }]}>{gpsAddress}</Text>
                        ) : null}
                        <Text style={[styles.locationCoords, { color: colors.textMuted }]}>
                            {myLocation.lat.toFixed(5)}, {myLocation.lng.toFixed(5)}
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.locationHint, { color: colors.textMuted }]}>
                        Toque abaixo para usar sua localização
                    </Text>
                )}
                <Pressable
                    onPress={handleGetMyLocation}
                    disabled={isGpsLoading}
                    style={[styles.gpsBtn, { backgroundColor: colors.primary, opacity: isGpsLoading ? 0.6 : 1 }]}
                >
                    <Text style={styles.gpsBtnText}>
                        {isGpsLoading ? 'Buscando...' : myLocation ? '🔄 Atualizar' : '📡 Minha Localização'}
                    </Text>
                </Pressable>
            </View>

            {/* SectionList de ecopontos agrupados por categoria */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderEcocard}
                contentContainerStyle={styles.listContent}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                            ♻️ {title}
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

// estilização
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
    locationCard: {
        margin: 16,
        marginBottom: 0,
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    locationInfo: { gap: 2 },
    locationTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    locationAddr: { fontSize: 13 },
    locationCoords: { fontSize: 11 },
    locationHint: { fontSize: 13 },
    gpsBtn: {
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
    },
    gpsBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    listContent: { padding: 16, paddingTop: 8 },
    sectionHeader: {
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: { fontSize: 20 },
    infoContainer: { flex: 1, gap: 4 },
    ecoName: {
        fontSize: 15,
        fontWeight: '600',
    },
    ecoAddress: { fontSize: 12 },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    chip: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
    },
    chipTxt: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    mapsBtn: {
        borderWidth: 1.5,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    mapsBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
});