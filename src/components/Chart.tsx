import React from 'react';
import { View, Text } from 'react-native';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartProps {
  data: ChartData[];
  title: string;
  maxValue?: number;
}

export const Chart: React.FC<ChartProps> = ({ data, title, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333333' }}>
        {title}
      </Text>
      
      <View style={{ gap: 8 }}>
        {data.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, marginRight: 8, backgroundColor: item.color }} />
            <Text style={{ flex: 1, fontSize: 14, color: '#555555' }}>
              {item.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View 
                style={[
                  { 
                    backgroundColor: item.color,
                    width: `${(item.value / max) * 100}%`,
                    minWidth: 20,
                  }
                ]} 
              />
              <Text style={{ fontSize: 14, fontWeight: 'medium', color: '#333333' }}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ProgressChart: React.FC<{ value: number; max: number; label: string; color: string }> = ({ 
  value, 
  max, 
  label, 
  color 
}) => {
  const percentage = (value / max) * 100;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'medium', color: '#555555' }}>
          {label}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>
          {value}/{max}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#E0E0E0' }}>
        <View 
          style={[
            { 
              backgroundColor: color,
              width: `${percentage}%`,
            }
          ]} 
        />
      </View>
    </View>
  );
}; 