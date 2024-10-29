// CouponDetailModalStyles.js
import { StyleSheet } from 'react-native';

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

export default styles;