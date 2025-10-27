/**
 * Custom Picker Component
 * Cross-platform dropdown/select component for React Native and React Native Web
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';

interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  style?: any;
  textStyle?: any;
  dropdownStyle?: any;
  itemTextStyle?: any;
  theme?: any;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  placeholder = 'Select an option',
  style,
  textStyle,
  dropdownStyle,
  itemTextStyle,
  theme,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  if (Platform.OS === 'web') {
    // Use native HTML select for web
    return (
      <View style={[styles.webContainer, style]}>
        <select
          value={selectedValue}
          onChange={(e: any) => onValueChange(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: theme?.colors?.border || '#d1d5db',
            backgroundColor: theme?.colors?.inputBackground || '#ffffff',
            color: theme?.colors?.text || '#000000',
            cursor: 'pointer',
            outline: 'none',
            ...dropdownStyle,
          }}>
          {items.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  // Use Modal with TouchableOpacity for mobile
  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.mobileButton,
          {
            backgroundColor: theme?.colors?.inputBackground || '#f3f4f6',
            borderColor: theme?.colors?.border || '#d1d5db',
          },
          dropdownStyle,
        ]}
        onPress={() => setIsModalVisible(true)}>
        <Text
          style={[
            styles.mobileButtonText,
            {color: theme?.colors?.text || '#000000'},
            textStyle,
          ]}>
          {displayText}
        </Text>
        <Text
          style={[
            styles.dropdownIcon,
            {color: theme?.colors?.text || '#000000'},
          ]}>
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme?.colors?.card || '#ffffff'},
            ]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {color: theme?.colors?.text || '#000000'},
                ]}>
                {placeholder}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text
                  style={[
                    styles.closeButton,
                    {color: theme?.colors?.primary || '#3b82f6'},
                  ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor:
                        item.value === selectedValue
                          ? theme?.colors?.primaryLight || '#dbeafe'
                          : 'transparent',
                      borderBottomColor: theme?.colors?.border || '#e5e7eb',
                    },
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalItemText,
                      {
                        color:
                          item.value === selectedValue
                            ? theme?.colors?.primary || '#3b82f6'
                            : theme?.colors?.text || '#000000',
                      },
                      itemTextStyle,
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Text
                      style={[
                        styles.checkMark,
                        {color: theme?.colors?.primary || '#3b82f6'},
                      ]}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
  },
  mobileButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
  },
  mobileButtonText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CustomPicker;
