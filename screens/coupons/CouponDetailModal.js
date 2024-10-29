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
import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
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

    // 상태 초기화
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

    // 추가 필드 상태
    const [canBeCombined, setCanBeCombined] = useState(coupon ? coupon.canBeCombined : true); // 기본값 true
    const [available, setAvailable] = useState(coupon ? coupon.available : true); // 기본값 true

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [action, setAction] = useState(null);
    const [isError, setIsError] = useState(false);

    const [errors, setErrors] = useState({
        couponName: '',
        couponDescription: '',
        discountValue: '',
        minOrderValue: '',
        maxDiscountValue: '',
    });

    const validateInputs = () => {
        const newErrors = {
            couponName: '',
            couponDescription: '',
            discountValue: '',
            minOrderValue: '',
            maxDiscountValue: '',
            dateRange: '',
        };

        if (couponName.length > 20) {
            newErrors.couponName = '쿠폰 이름은 20자를 초과할 수 없습니다.';
        }
        if (couponDescription.length > 100) {
            newErrors.couponDescription = '쿠폰 설명은 100자를 초과할 수 없습니다.';
        }
        if (discountType === '원' && parseInt(discountValue) > 50000) {
            newErrors.discountValue = '할인 값은 5만원을 넘길 수 없습니다.';
        }
        if (discountType === '%' && parseInt(discountValue) > 50) {
            newErrors.discountValue = '할인 값은 50을 넘길 수 없습니다.';
        }
        if (parseInt(minOrderValue) < 0) {
            newErrors.minOrderValue = '최소 주문 금액은 0보다 작을 수 없습니다.';
        }
        if (parseInt(maxDiscountValue) > 50000) {
            newErrors.maxDiscountValue = '최대 할인 금액은 5만원을 넘길 수 없습니다.';
        }
        if (startDate > endDate) {
            newErrors.dateRange = '시작일이 종료일보다 클 수 없습니다.';
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

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
        if (!validateInputs()) {
            setIsError(true); // 입력값이 유효하지 않으면 에러 상태 설정
            return; // 유효하지 않으면 함수 종료
        }

        const couponRef = doc(collection(firestore, 'coupon')); // 새로운 문서 참조 생성
        try {
            await setDoc(couponRef, {
                name: couponName,
                description: couponDescription,
                startDate: `${startDate.getFullYear().toString().slice(-2)}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`,
                endDate: `${endDate.getFullYear().toString().slice(-2)}${(endDate.getMonth() + 1).toString().padStart(2, '0')}${endDate.getDate().toString().padStart(2, '0')}`,
                discountType: discountType,
                discountValue: parseInt(discountValue),
                minOrderValue: parseInt(minOrderValue),
                maxDiscountValue: parseInt(maxDiscountValue),
                canBeCombined: canBeCombined,
                available: available,
            });
            onClose(); // 추가 후 모달 닫기
        } catch (error) {
            console.error('쿠폰 추가 중 오류 발생:', error);
        }
    };

    const handleUpdateCoupon = async () => {
        if (!validateInputs()) {
            return; // 입력값이 유효하지 않으면 함수 종료
        }

        const couponRef = doc(firestore, 'coupon', coupon.id);
        try {
            await updateDoc(couponRef, {
                name: couponName,
                description: couponDescription,
                startDate: `${startDate.getFullYear().toString().slice(-2)}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`,
                endDate: `${endDate.getFullYear().toString().slice(-2)}${(endDate.getMonth() + 1).toString().padStart(2, '0')}${endDate.getDate().toString().padStart(2, '0')}`,
                discountValue: parseInt(discountValue),
                minOrderValue: parseInt(minOrderValue),
                maxDiscountValue: parseInt(maxDiscountValue),
                canBeCombined: canBeCombined,
                available: available,
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

    const handleConfirmAction = async () => {
        // 입력값 유효성 검사
        if (!validateInputs()) {
            setIsError(true); // 에러가 있을 경우 상태를 true로 설정
            return; // 유효하지 않으면 함수 종료
        }

        // 유효한 경우 추가, 수정, 삭제 처리
        if (action === 'update') {
            await handleUpdateCoupon();
        } else if (action === 'delete') {
            await handleDeleteCoupon();
        } else if (action === 'add') {
            await handleAddCoupon();
        }

        // 작업이 성공적으로 완료된 경우 모달 닫기
        onClose();
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.modalInputContainer}>
                        <Text style={errors.couponName ? styles.errorLabel : styles.label}>
                            {errors.couponName || '쿠폰 이름'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="쿠폰 이름"
                            value={couponName}
                            onChangeText={setCouponName}
                        />

                        <Text style={errors.couponDescription ? styles.errorLabel : styles.label}>
                            {errors.couponDescription || '쿠폰 설명'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="쿠폰 설명"
                            value={couponDescription}
                            onChangeText={setCouponDescription}
                        />

                        <View style={styles.separator} />

                        <Text style={errors.discountValue ? styles.errorLabel : styles.label}>
                            {errors.discountValue || '할인 값 설정'}
                        </Text>
                        <View style={styles.discountTypeContainer}>
                            <TextInput
                                style={styles.discountInput}
                                placeholder="할인 값 설정"
                                keyboardType="numeric"
                                value={discountValue}
                                onChangeText={setDiscountValue}
                            />
                            <View style={styles.discountTypeButtonContainer}>
                                <TouchableOpacity
                                    onPress={() => setDiscountType('원')}
                                    style={[
                                        styles.radioButton,
                                        discountType !== '원' && styles.inactiveRadio,
                                        discountType === '원' && styles.activeRadio,
                                        { flex: 1 }, // 버튼 너비를 동일하게 설정
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
                                        { flex: 1 }, // 버튼 너비를 동일하게 설정
                                    ]}
                                >
                                    <Text style={discountType === '%' ? styles.selectedRadio : styles.radio}>
                                        %
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={errors.minOrderValue ? styles.errorLabel : styles.label}>
                            {errors.minOrderValue || '최소 주문 금액'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="금액 입력"
                            keyboardType="numeric"
                            value={minOrderValue}
                            onChangeText={setMinOrderValue}
                        />

                        <Text style={errors.maxDiscountValue ? styles.errorLabel : styles.label}>
                            {errors.maxDiscountValue || '최대 할인 금액'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="금액 입력"
                            keyboardType="numeric"
                            value={maxDiscountValue}
                            onChangeText={setMaxDiscountValue}
                        />

                        <Text style={errors.dateRange ? styles.errorLabel : styles.label}>
                            {errors.dateRange || '기간 설정'}
                        </Text>
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

                    <View style={styles.separator} />

                    <View style={styles.rowContainer}>
                        <Text style={styles.label}>다른 쿠폰과 함께 사용 가능</Text>
                        <View style={styles.radioContainer}>
                            <TouchableOpacity
                                onPress={() => setCanBeCombined(true)}
                                style={[
                                    styles.radioButton,
                                    canBeCombined && styles.activeRadio,
                                    !canBeCombined && styles.inactiveRadio,
                                    { flex: 0.3 }, // 너비를 동일하게 설정
                                ]}
                            >
                                <Text style={canBeCombined ? styles.selectedRadio : styles.radio}>가능</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setCanBeCombined(false)}
                                style={[
                                    styles.radioButton,
                                    !canBeCombined && styles.activeRadio,
                                    canBeCombined && styles.inactiveRadio,
                                    { flex: 0.3 }, // 너비를 동일하게 설정
                                ]}
                            >
                                <Text style={!canBeCombined ? styles.selectedRadio : styles.radio}>불가능</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.rowContainer}>
                        <Text style={styles.label}>쿠폰 활성화</Text>
                        <View style={styles.radioContainer}>
                            <TouchableOpacity
                                onPress={() => setAvailable(true)}
                                style={[
                                    styles.radioButton,
                                    available && styles.activeRadio,
                                    !available && styles.inactiveRadio,
                                    { flex: 0.3 }, // 너비를 동일하게 설정
                                ]}
                            >
                                <Text style={available ? styles.selectedRadio : styles.radio}>활성</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setAvailable(false)}
                                style={[
                                    styles.radioButton,
                                    !available && styles.activeRadio,
                                    available && styles.inactiveRadio,
                                    { flex: 0.3 }, // 너비를 동일하게 설정
                                ]}
                            >
                                <Text style={!available ? styles.selectedRadio : styles.radio}>비활성</Text>
                            </TouchableOpacity>
                        </View>
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
                                <Button title="추가" onPress={() => openConfirmationModal('add')} />
                            </View>
                        )}
                    </View>

                    {showConfirmationModal && (
                        <ConfirmationModal
                            visible={showConfirmationModal}
                            message={isError
                                ? "잘못된 입력값이 있습니다"
                                : action === 'add'
                                    ? "이 쿠폰을 추가하시겠습니까?"
                                    : action === 'update'
                                        ? "이 쿠폰을 수정하시겠습니까?"
                                        : "이 쿠폰을 삭제하시겠습니까?"}
                            onConfirm={handleConfirmAction} // 동적으로 호출
                            onClose={() => {
                                setShowConfirmationModal(false);
                                setIsError(false); // 모달이 닫힐 때 에러 상태 초기화
                            }}
                            isError={isError} // 에러 상태 전달
                        />
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </Modal >
    );
};

export default CouponDetailModal;