import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useNavigation } from "@react-navigation/native";
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore'
import emailVerifyIcon from '../icons/email_verify.png'
import {
    View,
    Text,
    Button,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';

const EmailVerificationScreen = () => {

    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [timer, setTimer] = useState(60);
    const [verificationMessage, setVerificationMessage] = useState('Check your email');
    console.log("Verify your email");
    const navigation = useNavigation();

    useEffect(() => {
        console.log("Useeffect run ");
        const checkEmailVerification = async () => {
            console.log("Checking email verification");
            const user = auth().currentUser;
            console.log("useEffect user : ", user);
            if (user) {
                try {
                    await user.reload();
                    await user.getIdToken(true);

                    if (user.emailVerified) {
                        setVerificationMessage("Email Verified");
                        console.log("Email verified");

                        const userData = {
                            id: user.uid,
                            name: user.displayName,
                            email: user.email,
                        };

                        // Get a reference to the Firestore database
                        const db = getFirestore();
                        // Specify the path to the document
                        const userDocRef = doc(db, 'users', userData.id);

                        // Set the data in the specified document
                        await setDoc(userDocRef, userData)
                            .then(() => {
                                console.log('User data successfully written to Firestore!');
                            })
                            .catch((error) => {
                                console.error('Error writing user data to Firestore: ', error);
                            });

                        setTimeout(() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Main' }],
                            });
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Error refreshing user: ', err);
                }
            }
        };

        const intervalId = setInterval(() => {
            console.log("Interval Id run");
            checkEmailVerification();
        }, 4000);

        return () => clearInterval(intervalId);
    }, [navigation]);

    useEffect(() => {
        let interval;

        if (timer > 0 && !buttonEnabled) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            setButtonEnabled(true);
        }

        return () => {
            clearInterval(interval);
        };
    }, [timer, buttonEnabled]);

    const handleResendVerification = async () => {
        console.log("Resend verification run");
        const user = auth().currentUser;

        if (user) {
            try {
                await user.sendEmailVerification();
                setVerificationMessage('Verification email resent. Check your email.');
                console.log("Verification email resent. Check your email");
                setButtonEnabled(false);
                setTimer(60);
            } catch (err) {
                console.error('Error resending verification email: ', err);
                console.log("Error resending verification email: ", err);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Image source={emailVerifyIcon} style={styles.emailverifyicon} />
            <Text style={styles.headText}>{verificationMessage}</Text>
            <Text style={styles.textStyle}>Open your inbox and click on the link to verify your email</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: "white" }}>
                {buttonEnabled ? 'Resend Verification Email' : `Resend verification in ${timer} seconds`}
            </Text>
            <TouchableOpacity
                style={[styles.resendButton, buttonEnabled ? styles.enabledButton : styles.disabledButton]}
                onPress={handleResendVerification}
                disabled={!buttonEnabled}
            >
                <Text style={{ fontSize: 18, fontWeight: '500', color: "#04080F" }}>Resend Verification Email</Text>
            </TouchableOpacity>
        </View>
    )
};

const { width } = Dimensions.get("screen")
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04080f',
    },
    emailverifyicon: {
        width: 100,
        height: 100,
        marginVertical: 20
    },
    headText: {
        color: '#a1c6ea',
        fontSize: 32,
        marginHorizontal: 10,
        marginVertical: 10,
        textAlign: 'center'

    },
    textStyle: {
        color: 'white',
        fontSize: 18,
        marginHorizontal: 10,
        marginVertical: 30,
        textAlign: 'center'
    },
    resendButton: {
        width: width - 50,
        marginTop: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 50,
        padding: 15
    },
    enabledButton: {
        // Additional styles when the button is enabled
        backgroundColor: '#A1C6EA',
    },
    disabledButton: {
        // Additional styles when the button is disabled
        backgroundColor: 'grey',
    },
})

export default EmailVerificationScreen;