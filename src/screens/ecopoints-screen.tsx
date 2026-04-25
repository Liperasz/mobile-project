import React from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import Card from '../components/card';
import { useTheme } from '../context/theme-context';

// tipos de lixo
type WasteType = 'Plástico' | 'Vidro' | 'Papel' | 'Metal' | 'Eletrônico' | 'Orgânico';

// infos dos ecopoints
type Ecopoint = {
    id: string;
    name: string;
    address: string;
    types: WasteType[];
    icon: string;
};

// dados inventados
const ECOPOINTS: Ecopoint[] = [
    { id: 'e1', name: 'Coop Verde Sul',   address: 'Rua das Acácias, 234 — Bom Retiro',
      types: ['Plástico', 'Vidro', 'Papel'], icon: '♻' },
    { id: 'e2', name: 'EcoPonto Central', address: 'Av. Paulista, 1001 — Bela Vista',
      types: ['Eletrônico', 'Metal', 'Plástico'], icon: '🔋' },
    { id: 'e3', name: 'Recicla Fácil',    address: 'R. Augusta, 78 — Consolação',
      types: ['Papel', 'Plástico', 'Orgânico'], icon: '🌿' },
    { id: 'e4', name: 'CoopMais Itaim',   address: 'Al. Franca, 450 — Itaim Bibi',
      types: ['Vidro', 'Metal', 'Eletrônico'], icon: '🔧' },
];

// cores de cada tipo de lixo
const CHIP_COLORS: Record<WasteType, { bg: string; text: string }> = {
    Plástico:   { bg: '#dbeafe', text: '#1e40af' },
    Vidro:      { bg: '#fce7f3', text: '#9d174d' },
    Orgânico:   { bg: '#dcfce7', text: '#166534' },
    Eletrônico: { bg: '#fef3c7', text: '#92400e' },
    Papel:      { bg: '#ede9fe', text: '#4c1d95' },
    Metal:      { bg: '#fee2e2', text: '#991b1b' },
};

export default function EcopointsScreen() {

    // cores do tema
    const { colors } = useTheme();

    // cards dos ecopoints
    const renderEcocard = ({ item }: ListRenderItemInfo<Ecopoint>) => (
        <Card>
            <View style={styles.row}>
                {/* ícone do ecoponto */}
                <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.ecoName, { color: colors.text }]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.ecoAddress, { color: colors.textMuted }]}>
                        {item.address}
                    </Text>
                    {/* chips de tipos de resíduo */}
                    <View style={styles.chips}>
                        {item.types.map(t => (
                            <View
                                key={t}
                                style={[styles.chip, { backgroundColor: CHIP_COLORS[t].bg }]}
                            >
                                <Text style={[styles.chipTxt, { color: CHIP_COLORS[t].text }]}>
                                    {t}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header da tela */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    Ecopontos próximos
                </Text>
            </View>
            // Flatlist contendo os ecopontos
            <FlatList
                data={ECOPOINTS}
                keyExtractor={item => item.id}
                renderItem={renderEcocard}
                contentContainerStyle={styles.listContent}
            />
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
  listContent: {
    padding: 16,
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
  iconText: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  ecoName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  ecoAddress: {
    fontSize: 12,
    marginBottom: 8,
  },
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
});