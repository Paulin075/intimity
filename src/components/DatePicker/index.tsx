import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const DatePicker = ({ value, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleConfirm = (event, selectedDate) => {
    setIsVisible(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Text>{value.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {isVisible && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleConfirm}
        />
      )}
    </View>
  );
};
