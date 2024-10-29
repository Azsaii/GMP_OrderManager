import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import CouponDetailModal from './CouponDetailModal';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCoupons(); // 컴포넌트가 마운트될 때 쿠폰 정보를 가져옴
    }, []);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const couponsSnapshot = await getDocs(collection(firestore, 'coupon'));
            const couponsData = couponsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCoupons(couponsData);
        } catch (error) {
            console.error('쿠폰 정보를 가져오는 중 오류 발생:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (item) => {
        setSelectedCoupon(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedCoupon(null);
        fetchCoupons();
    };

    const renderCouponItem = ({ item }) => (
        <View style={styles.couponItem}>
            <Text style={styles.couponTitle}>{item.name}</Text>
            <TouchableOpacity onPress={() => openModal(item)}>
                <Text style={styles.detailsButton}>상세</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>쿠폰 관리</Text>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <>
                    <FlatList
                        data={coupons}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCouponItem}
                        contentContainerStyle={styles.list}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => console.log('쿠폰 작성')}>
                        <Icon name="add" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>쿠폰 작성</Text>
                    </TouchableOpacity>
                </>
            )}

            {selectedCoupon && ( // 쿠폰이 선택된 경우에만 모달을 렌더링
                <CouponDetailModal
                    isVisible={modalVisible}
                    onClose={closeModal}
                    coupon={selectedCoupon}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    list: {
        paddingBottom: 20,
    },
    couponItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 1,
    },
    couponTitle: {
        fontSize: 16,
    },
    detailsButton: {
        color: '#007BFF',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#007BFF',
        borderRadius: 8,
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        marginLeft: 8,
    },
    loader: {
        alignSelf: 'center',
        marginTop: '40%',
    },
});

export default CouponManagement;
