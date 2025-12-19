import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function UIComponentShowcaseScreen({ navigation }: any) {
  const handleButtonPress = () => {
    Alert.alert('Button Pressed', 'You tapped a button!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SectionHeader 
        title="UI Component Showcase" 
        subtitle="Demonstration of all available components"
        icon="🎨"
      />

      {/* Buttons Section */}
      <Card title="Buttons" style={styles.sectionCard}>
        <View style={styles.componentRow}>
          <Button title="Primary" variant="primary" onPress={handleButtonPress} />
          <Button title="Secondary" variant="secondary" onPress={handleButtonPress} />
        </View>
        <View style={styles.componentRow}>
          <Button title="Outline" variant="outline" onPress={handleButtonPress} />
          <Button title="Ghost" variant="ghost" onPress={handleButtonPress} />
        </View>
        <View style={styles.componentRow}>
          <Button title="Danger" variant="danger" onPress={handleButtonPress} />
          <Button title="Disabled" variant="primary" disabled onPress={handleButtonPress} />
        </View>
        <View style={styles.componentRow}>
          <Button title="Small" variant="primary" size="small" onPress={handleButtonPress} />
          <Button title="Medium" variant="primary" size="medium" onPress={handleButtonPress} />
          <Button title="Large" variant="primary" size="large" onPress={handleButtonPress} />
        </View>
        <View style={styles.componentRow}>
          <Button 
            title="With Icon" 
            variant="primary" 
            icon={<MaterialIcons name="add" size={20} color="#fff" />} 
            onPress={handleButtonPress}
          />
          <Button title="Full Width" variant="primary" fullWidth onPress={handleButtonPress} />
        </View>
      </Card>

      {/* Inputs Section */}
      <Card title="Inputs" style={styles.sectionCard}>
        <Input 
          label="Default Input"
          placeholder="Enter text"
          value=""
          onChangeText={() => {}}
        />
        <Input 
          label="Required Input"
          placeholder="This field is required"
          value=""
          onChangeText={() => {}}
          required
        />
        <Input 
          label="Input with Error"
          placeholder="Enter valid email"
          value=""
          onChangeText={() => {}}
          error="Please enter a valid email address"
        />
        <Input 
          label="Secure Text"
          placeholder="Enter password"
          value=""
          onChangeText={() => {}}
          secureTextEntry
        />
        <Input 
          label="Multiline Input"
          placeholder="Enter description"
          value=""
          onChangeText={() => {}}
          multiline
          numberOfLines={3}
        />
      </Card>

      {/* Cards Section */}
      <Card title="Cards" style={styles.sectionCard}>
        <Card 
          title="Elevated Card"
          subtitle="This is an elevated card with shadow"
          variant="elevated"
          style={styles.demoCard}
        >
          <Text style={styles.cardContent}>Card content goes here</Text>
        </Card>
        
        <Card 
          title="Outlined Card"
          subtitle="This is an outlined card with border"
          variant="outlined"
          style={styles.demoCard}
        >
          <Text style={styles.cardContent}>Card content goes here</Text>
        </Card>
        
        <Card 
          title="Filled Card"
          subtitle="This is a filled card"
          variant="filled"
          style={styles.demoCard}
        >
          <Text style={styles.cardContent}>Card content goes here</Text>
        </Card>
        
        <Card 
          title="Interactive Card"
          subtitle="This card is clickable"
          onPress={() => alert('Card pressed!')}
          style={styles.demoCard}
        >
          <Text style={styles.cardContent}>Tap anywhere on this card</Text>
        </Card>
      </Card>

      {/* Empty States Section */}
      <Card title="Empty States" style={styles.sectionCard}>
        <EmptyState 
          title="No Items Found"
          subtitle="There are no items to display right now"
          icon="📦"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  demoCard: {
    marginBottom: Spacing.md,
  },
  cardContent: {
    ...Typography.bodyLarge,
    color: Colors.light.text,
  },
});