import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ConfirmationModal from '../components/ConfirmationModal';

const CouponDetailModal = ({ isVisible, onClose, coupon }) => {
    const [startDate, setStartDate] = useState(() => {
        const startDateString = coupon.startDate; // '241029' 형식
        const year = parseInt(startDateString.slice(0, 2), 10) + 2000; // YY -> YYYY 변환
        const month = parseInt(startDateString.slice(2, 4), 10) - 1; // 0 기준으로 조정
        const day = parseInt(startDateString.slice(4, 6), 10);
        return new Date(year, month, day);
    });

    const [endDate, setEndDate] = useState(() => {
        const endDateString = coupon.endDate; // '241029' 형식
        const year = parseInt(endDateString.slice(0, 2), 10) + 2000; // YY -> YYYY 변환
        const month = parseInt(endDateString.slice(2, 4), 10) - 1; // 0 기준으로 조정
        const day = parseInt(endDateString.slice(4, 6), 10);
        return new Date(year, month, day);
    });

    const [couponName, setCouponName] = useState(coupon.name); // 쿠폰 이름 초기화
    const [couponDescription, setCouponDescription] = useState(coupon.description); // 쿠폰 설명 초기화
    const [discountValue, setDiscountValue] = useState(coupon.discountValue.toString()); // 할인 값 초기화
    const [discountType, setDiscountType] = useState(coupon.discountType || '원'); // 할인 타입 초기화
    const [minOrderValue, setMinOrderValue] = useState(coupon.minOrderValue.toString()); // 최소 주문 금액 초기화
    const [maxDiscountValue, setMaxDiscountValue] = useState(coupon.maxDiscountValue.toString()); // 최대 할인 금액 초기화
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [action, setAction] = useState(null);

    if (!coupon) return null;

    const openConfirmationModal = (type) => {
        setAction(type); // 수정 또는 삭제 작업 설정
        setShowConfirmationModal(true);
    };

    const handleStartDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        setStartDate(currentDate);
        setShowStartDatePicker(false);
    };

    const handleEndDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        setEndDate(currentDate);
        setShowEndDatePicker(false);
    };

    // 날짜를 'YY.MM.DD' 형식으로 변환하는 함수
    const formatDateString = (date) => {
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const handleUpdateCoupon = async () => {
        const couponRef = doc(firestore, 'coupon', coupon.id);
        try {
            await updateDoc(couponRef, {
                name: couponName, // 수정된 쿠폰 이름 반영
                description: couponDescription, // 수정된 쿠폰 설명 반영
                startDate: `${startDate.getFullYear().toString().slice(-2)}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`,
                endDate: `${endDate.getFullYear().toString().slice(-2)}${(endDate.getMonth() + 1).toString().padStart(2, '0')}${endDate.getDate().toString().padStart(2, '0')}`,
                discountValue: parseInt(discountValue),
                minOrderValue: parseInt(minOrderValue),
                maxDiscountValue: parseInt(maxDiscountValue),
            });
            onClose(); // 수정 후 모달 닫기
        } catch (error) {
            console.error('쿠폰 수정 중 오류 발생:', error);
        }
    };

    const handleDeleteCoupon = async () => {
        const couponRef = doc(firestore, 'coupon', coupon.id);
        try {
            await deleteDoc(couponRef);
            onClose(); // 삭제 후 모달 닫기
        } catch (error) {
            console.error('쿠폰 삭제 중 오류 발생:', error);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // 플랫폼에 따라 동작 설정
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.modalInputContainer}>
                        <Text style={styles.label}>쿠폰 이름</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="쿠폰 이름"
                            value={couponName} // 쿠폰 이름 상태 사용
                            onChangeText={setCouponName} // 쿠폰 이름 수정 시 상태 업데이트
                        />

                        <Text style={styles.label}>쿠폰 설명</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="쿠폰 설명"
                            value={couponDescription} // 쿠폰 설명 상태 사용
                            onChangeText={setCouponDescription} // 쿠폰 설명 수정 시 상태 업데이트
                        />

                        <View style={styles.separator} />

                        <Text style={styles.label}>할인 값 설정</Text>
                        <View style={styles.discountTypeContainer}>
                            <TextInput
                                style={styles.discountInput}
                                placeholder="할인 값 설정"
                                keyboardType="numeric"
                                value={discountValue} // defaultValue에서 value로 변경
                                onChangeText={setDiscountValue} // 입력 시 상태 업데이트
                            />
                            <View style={styles.radioContainer}>
                                <TouchableOpacity
                                    onPress={() => setDiscountType('원')}
                                    style={[
                                        styles.radioButton,
                                        discountType !== '원' && styles.inactiveRadio,
                                        discountType === '원' && styles.activeRadio,
                                    ]}
                                >
                                    <Text style={discountType === '원' ? styles.selectedRadio : styles.radio}>
                                        원
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setDiscountType('%')}
                                    style={[
                                        styles.radioButton,
                                        discountType !== '%' && styles.inactiveRadio,
                                        discountType === '%' && styles.activeRadio,
                                    ]}
                                >
                                    <Text style={discountType === '%' ? styles.selectedRadio : styles.radio}>
                                        %
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.label}>최소 주문 금액</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="금액 입력"
                            keyboardType="numeric"
                            value={minOrderValue} // defaultValue에서 value로 변경
                            onChangeText={setMinOrderValue} // 입력 시 상태 업데이트
                        />

                        <Text style={styles.label}>최대 할인 금액</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="금액 입력"
                            keyboardType="numeric"
                            value={maxDiscountValue} // defaultValue에서 value로 변경
                            onChangeText={setMaxDiscountValue} // 입력 시 상태 업데이트
                        />

                        <Text style={styles.label}>기간 설정</Text>
                        <View style={styles.datePickerContainer}>
                            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateInputContainer}>
                                <View style={styles.dateInputWrapper}>
                                    <Text style={styles.dateText}>{formatDateString(startDate)}</Text>
                                    <Icon name="calendar-outline" size={24} color="#000" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateInputContainer}>
                                <View style={styles.dateInputWrapper}>
                                    <Text style={styles.dateText}>{formatDateString(endDate)}</Text>
                                    <Icon name="calendar-outline" size={24} color="#000" />
                                </View>
                            </TouchableOpacity>
                        </View>
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={handleStartDateChange}
                            />
                        )}
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={handleEndDateChange}
                            />
                        )}
                    </View>
                    <View style={styles.buttonContainer}>
                        <View style={styles.buttonHalf}>
                            <Button title="수정" onPress={() => openConfirmationModal('update')} />
                        </View>
                        <View style={styles.buttonHalf}>
                            <Button title="삭제" color="red" onPress={() => openConfirmationModal('delete')} />
                        </View>
                    </View>

                    {showConfirmationModal && (
                        <ConfirmationModal
                            visible={showConfirmationModal}
                            message={`이 쿠폰을 ${action === 'update' ? '수정' : '삭제'}하시겠습니까?`}
                            onConfirm={action === 'update' ? handleUpdateCoupon : handleDeleteCoupon} // 동적으로 호출
                            onClose={() => setShowConfirmationModal(false)} // 모달 닫기
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    couponInfoContainer: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    modalDetail: {
        marginBottom: 10,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#ced4da',
        marginVertical: 10,
    },
    modalInputContainer: {
        marginBottom: 20,
    },
    discountInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        marginRight: 10,
        height: 50,
    },
    discountTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    radioButton: {
        marginHorizontal: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
    inactiveRadio: {
        backgroundColor: '#d3d3d3',
        borderColor: '#ced4da',
    },
    activeRadio: {
        borderColor: '#007BFF',
    },
    radio: {
        color: 'black',
    },
    selectedRadio: {
        fontWeight: 'bold',
        color: '#007BFF',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateInputContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    dateInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        paddingRight: 15,
        height: 50,
        justifyContent: 'space-between',
    },
    dateText: {
        flex: 1,
        textAlign: 'center',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonHalf: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        marginBottom: 5, // 항목 이름과 입력 필드 사이의 간격 조정
        fontWeight: 'bold', // 항목 이름을 강조
        color: '#333',
    },
});

export default CouponDetailModal;
