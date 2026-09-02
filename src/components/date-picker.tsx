import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  onNextField?: () => void;
  placeholder?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Years range for birthdate (e.g., 100 years back from 18 years ago)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 90 }, (_, i) => currentYear - 14 - i);

export function DatePicker({
  value,
  onChange,
  onNextField,
  placeholder = 'DD/MM/YY',
}: DatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date(2000, 5, 15));
  const [viewDate, setViewDate] = useState<Date>(value || new Date(2000, 5, 15));
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const formattedDateString = value
    ? `${value.getDate()} ${SHORT_MONTH_NAMES[value.getMonth()]} ${value.getFullYear()}`
    : placeholder;

  const handleOpen = () => {
    const initial = value || new Date(2000, 5, 15);
    setSelectedDate(initial);
    setViewDate(initial);
    setShowYearDropdown(false);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    setModalVisible(false);
    if (onNextField) {
      setTimeout(() => {
        onNextField();
      }, 100);
    }
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectYear = (year: number) => {
    setViewDate((prev) => new Date(year, prev.getMonth(), 1));
    setShowYearDropdown(false);
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  return (
    <View style={styles.container}>
      {/* Clickable Date Picker Input Field */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={20} color="#00B49F" style={styles.inputIcon} />
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {formattedDateString}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Interactive Date Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Selected Date Summary Banner */}
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedBannerYear}>{selectedDate.getFullYear()}</Text>
              <Text style={styles.selectedBannerDate}>
                {`${DAYS_OF_WEEK[selectedDate.getDay()]}, ${SHORT_MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
              </Text>
            </View>

            {/* Navigation Header (Month & Year selector) */}
            <View style={styles.navHeader}>
              <TouchableOpacity
                style={styles.monthYearSelector}
                onPress={() => setShowYearDropdown(!showYearDropdown)}
              >
                <Text style={styles.monthYearText}>
                  {MONTH_NAMES[month]} {year}
                </Text>
                <Ionicons
                  name={showYearDropdown ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#111827"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              <View style={styles.navArrows}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
                  <Ionicons name="chevron-back" size={20} color="#374151" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                  <Ionicons name="chevron-forward" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Year Selector Dropdown View */}
            {showYearDropdown ? (
              <ScrollView style={styles.yearList} showsVerticalScrollIndicator>
                <View style={styles.yearGrid}>
                  {YEAR_OPTIONS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.yearItem,
                        y === year && styles.yearItemSelected,
                      ]}
                      onPress={() => handleSelectYear(y)}
                    >
                      <Text
                        style={[
                          styles.yearItemText,
                          y === year && styles.yearItemTextSelected,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              /* Calendar Grid View */
              <View style={styles.calendarContainer}>
                {/* Days of Week Header */}
                <View style={styles.weekHeader}>
                  {DAYS_OF_WEEK.map((d, i) => (
                    <Text key={i} style={styles.weekDayText}>
                      {d}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {calendarDays.map((dayNum, idx) => {
                    if (dayNum === null) {
                      return <View key={`empty-${idx}`} style={styles.dayCell} />;
                    }
                    const active = isSelected(dayNum);
                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={[styles.dayCell, active && styles.dayCellSelected]}
                        onPress={() => setSelectedDate(new Date(year, month, dayNum))}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            active && styles.dayTextSelected,
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Modal Actions Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  triggerButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFFFF',
    borderWidth: 1.5,
    borderColor: '#00F5D4',
    borderRadius: 14,
    paddingHorizontal: 16,
    width: '100%',
    shadowColor: '#00F5D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  selectedBanner: {
    backgroundColor: '#E0FDFD',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#93EAE6',
  },
  selectedBannerYear: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B49F',
    textTransform: 'uppercase',
  },
  selectedBannerDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  navArrows: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  yearList: {
    maxHeight: 220,
    marginVertical: 8,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  yearItem: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearItemSelected: {
    backgroundColor: '#00F5D4',
    borderColor: '#00F5D4',
  },
  yearItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  yearItemTextSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  calendarContainer: {
    marginBottom: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: '#00F5D4',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dayTextSelected: {
    fontWeight: '700',
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#00F5D4',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
});
