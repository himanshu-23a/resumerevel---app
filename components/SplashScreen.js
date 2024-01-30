import React, { useEffect } from 'react'
import auth from '@react-native-firebase/auth';
import { StackActions, useNavigation } from '@react-navigation/native';
import ResumeIcon from '../icons/resume.png'
import {
    View,
    Text,
    StyleSheet,
    Image
} from 'react-native'

export default function SplashScreen() {
    const navigation = useNavigation();

    useEffect(() => {
            try {
                const unsubscribe = auth().onAuthStateChanged((user) => {
                    const routeName = (user && user.emailVerified) ? 'Main' : 'Login';
                    navigation.dispatch(StackActions.replace(routeName));
                    unsubscribe();
                });
                return () => unsubscribe();
            } catch (err) {

            }        
    }, [navigation])

    return (
        <View style={styles.container}>
            <Image source={ResumeIcon} style={styles.resumeIcon} />
            <Text style={styles.headText}>ResumeRevel</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04080f'
    },
    headText: {
        fontSize: 32,
        fontWeight: '500',
        margin: 15,
        color: '#A1C6EA'
    },
    resumeIcon: {
        width: 100,
        height: 100,
        margin: 10,
        marginLeft: 30
    }
})