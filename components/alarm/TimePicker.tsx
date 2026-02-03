import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, spacing, typography } from '../../constants';

interface TimePickerProps {
  hour: number;
  minute: number;
  isAM: boolean;
  onTimeChange: (hour: number, minute: number, isAM: boolean) => void;
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods = ['AM', 'PM'] as const;

export function TimePicker({ hour, minute, isAM, onTimeChange }: TimePickerProps) {
  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);
  const periodListRef = useRef<FlatList>(null);

  const getInitialHourIndex = () => hours.indexOf(hour === 0 ? 12 : hour);
  const getInitialMinuteIndex = () => minute;
  const getInitialPeriodIndex = () => (isAM ? 0 : 1);

  const handleHourChange = useCallback(
    (index: number) => {
      const newHour = hours[index] || 12;
      onTimeChange(newHour, minute, isAM);
    },
    [minute, isAM, onTimeChange]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      const newMinute = minutes[index] || 0;
      onTimeChange(hour, newMinute, isAM);
    },
    [hour, isAM, onTimeChange]
  );

  const handlePeriodChange = useCallback(
    (index: number) => {
      const newIsAM = index === 0;
      onTimeChange(hour, minute, newIsAM);
    },
    [hour, minute, onTimeChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <View style={styles.selectionOverlay} />
        <ScrollPicker
          ref={hourListRef}
          data={hours}
          initialIndex={getInitialHourIndex()}
          onIndexChange={handleHourChange}
          formatItem={(item) => item.toString().padStart(2, '0')}
        />
        <Text style={styles.separator}>:</Text>
        <ScrollPicker
          ref={minuteListRef}
          data={minutes}
          initialIndex={getInitialMinuteIndex()}
          onIndexChange={handleMinuteChange}
          formatItem={(item) => item.toString().padStart(2, '0')}
        />
        <ScrollPicker
          ref={periodListRef}
          data={periods}
          initialIndex={getInitialPeriodIndex()}
          onIndexChange={handlePeriodChange}
          formatItem={(item) => item}
        />
      </View>
    </View>
  );
}

interface ScrollPickerProps<T> {
  data: readonly T[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
  formatItem: (item: T) => string;
}

const ScrollPicker = React.forwardRef<FlatList, ScrollPickerProps<any>>(
  ({ data, initialIndex, onIndexChange, formatItem }, ref) => {
    const flatListRef = useRef<FlatList>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    React.useImperativeHandle(ref, () => flatListRef.current!);

    React.useEffect(() => {
      if (flatListRef.current && initialIndex >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: initialIndex,
            animated: false,
          });
        }, 100);
      }
    }, []);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Capture the offset immediately before the event is recycled
      const offsetY = event.nativeEvent.contentOffset.y;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        onIndexChange(clampedIndex);
      }, 50);
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

      flatListRef.current?.scrollToIndex({
        index: clampedIndex,
        animated: true,
      });
      onIndexChange(clampedIndex);
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
      <View style={styles.item}>
        <Text style={styles.itemText}>{formatItem(item)}</Text>
      </View>
    );

    const getItemLayout = (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    });

    return (
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={getItemLayout}
        style={styles.picker}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT,
        }}
        scrollEventThrottle={16}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  picker: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 70,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    ...typography.displayMedium,
    color: colors.textPrimary,
  },
  separator: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    marginHorizontal: spacing.xs,
  },
});
