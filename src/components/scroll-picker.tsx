import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

export interface ScrollPickerOption<T = string | number> {
  label: string;
  value: T;
}

interface ScrollPickerProps<T = string | number> {
  options: ScrollPickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  itemHeight?: number;
  visibleItems?: number;
}

export function ScrollPicker<T extends string | number>({
  options,
  value,
  onChange,
  itemHeight = 44,
  visibleItems = 3,
}: ScrollPickerProps<T>) {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const containerHeight = itemHeight * visibleItems;
  const paddingVertical = (containerHeight - itemHeight) / 2;

  useEffect(() => {
    if (selectedIndex >= 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: selectedIndex * itemHeight,
        animated: true,
      });
    }
  }, [selectedIndex, itemHeight]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / itemHeight);
    if (index < 0) index = 0;
    if (index >= options.length) index = options.length - 1;
    if (options[index] && options[index].value !== value) {
      onChange(options[index].value);
    }
  };

  const handleItemPress = (itemValue: T, index: number) => {
    onChange(itemValue);
    scrollViewRef.current?.scrollTo({
      y: index * itemHeight,
      animated: true,
    });
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Middle Selection Highlight Bar */}
      <View
        style={[
          styles.selectionIndicator,
          {
            top: paddingVertical,
            height: itemHeight,
          },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingVertical: paddingVertical,
        }}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={`${option.value}-${index}`}
              activeOpacity={0.7}
              onPress={() => handleItemPress(option.value, index)}
              style={[styles.item, { height: itemHeight }]}
            >
              <Text
                style={[
                  styles.itemText,
                  isSelected ? styles.selectedItemText : styles.unselectedItemText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 4,
    right: 4,
    backgroundColor: '#E0FDFD',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#00F5D4',
    zIndex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  itemText: {
    fontSize: 15,
    textAlign: 'center',
  },
  selectedItemText: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 17,
  },
  unselectedItemText: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
});
