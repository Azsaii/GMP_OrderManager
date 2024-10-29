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
import { firestore } from '../../firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ConfirmationModal from '../../components/ConfirmationModal';
import styles from './CouponDetailModalStyles';

const CouponDetailModal = ({ isVisible, onClose, coupon }) => {
    // 날짜 문자열을 Date 객체로 변환하는 함수
    const parseDateString = (dateString) => {
        const year = parseInt(dateString.slice(0, 2), 10) + 2000;
        const month = parseInt(dateString.slice(2, 4), 10) - 1;
        const day = parseInt(dateString.slice(4, 6), 10);
        return new Date(year, month, day);
    };

    // 상태 초기화 수정
    const [startDate, setStartDate] = useState(() => {
        return coupon ? parseDateString(coupon.startDate) : new Date(); // 쿠폰이 없으면 현재 날짜
    });

    const [endDate, setEndDate] = useState(() => {
        return coupon ? parseDateString(coupon.endDate) : new Date(); // 쿠폰이 없으면 현재 날짜
    });

    const [couponName, setCouponName] = useState(coupon ? coupon.name : ''); // 쿠폰 이름 초기화
    const [couponDescription, setCouponDescription] = useState(coupon ? coupon.description : ''); // 쿠폰 설명 초기화
    const [discountValue, setDiscountValue] = useState(coupon ? coupon.discountValue.toString() : ''); // 할인 값 초기화
    const [discountType, setDiscountType] = useState(coupon ? coupon.discountType : "원"); // 할인 타입 초기화
    const [minOrderValue, setMinOrderValue] = useState(coupon ? coupon.minOrderValue.toString() : ''); // 최소 주문 금액 초기화
    const [maxDiscountValue, setMaxDiscountValue] = useState(coupon ? coupon.maxDiscountValue.toString() : ''); // 최대 할인 금액 초기화

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [action, setAction] = useState(null);

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

    const handleAddCoupon = async () => {
        const couponRef = doc(collection(firestore, 'coupon')); // 새로운 문서 참조 생성
        try {
            await setDoc(couponRef, {
                name: couponName,
                description: couponDescription,
                startDate: `${startDate.getFullYear().toString().slice(-2)}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`,
                endDate: `${endDate.getFullYear().toString().slice(-2)}${(endDate.getMonth() + 1).toString().padStart(2, '0')}${endDate.getDate().toString().padStart(2, '0')}`,
                discountValue: parseInt(discountValue),
                minOrderValue: parseInt(minOrderValue),
                maxDiscountValue: parseInt(maxDiscountValue),
            });
            onClose(); // 추가 후 모달 닫기
        } catch (error) {
            console.error('쿠폰 추가 중 오류 발생:', error);
        }
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
                        {coupon ? ( // 쿠폰이 있는 경우 수정/삭제 버튼 표시
                            <>
                                <View style={styles.buttonHalf}>
                                    <Button title="수정" onPress={() => openConfirmationModal('update')} />
                                </View>
                                <View style={styles.buttonHalf}>
                                    <Button title="삭제" color="red" onPress={() => openConfirmationModal('delete')} />
                                </View>
                            </>
                        ) : ( // 쿠폰이 없는 경우 추가 버튼 표시
                            <View style={styles.buttonHalf}>
                                <Button title="추가" onPress={handleAddCoupon} />
                            </View>
                        )}
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

export default CouponDetailModal;
