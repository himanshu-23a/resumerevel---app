import React from 'react';
import {StackActions ,useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert
} from 'react-native';


const Logout = () => {
    const navigation = useNavigation();

    const handleLogout = () => {
        Alert.alert('Alert', 'Confirm Logging Out?', [
            {
                text: 'Cancel',
                onPress: () => {
                    console.log('Cancel');
                },
            },
            {
                text: 'ok',
                onPress: async () => {
                    console.log('Logout')
                    await auth().signOut();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'SplashScreen' }],
                    });                }
            }
        ])
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headText}>Confirm Logging Out ?</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={{ fontSize: 20, fontWeight: '500', color: "white" }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const { width } = Dimensions.get('screen');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04080f'
    },
    headText: {
        fontSize: 18,
        fontWeight: '500',
        margin: 15,
        color: '#A1C6EA'
    },
    logoutButton: {
        width: width - 50,
        marginTop: 10,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: '#FF0000',
        borderRadius: 50,
        padding: 10
    }
});

export default Logout;