import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import signupIcon from '../icons/signup.png'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Image,
    ActivityIndicator
} from 'react-native';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation();

    const handleSignup = async () => {
        console.log("Handle Sign Up");

        if (email && password) {
            try {
                setIsLoading(true);
                const userCredential = await auth().createUserWithEmailAndPassword(email, password);

                await userCredential.user.updateProfile({
                    displayName: name,
                });

                await auth().currentUser.sendEmailVerification();
                setIsLoading(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'EmailVerificationScreen' }]
                });
                setIsLoading(false);
                setErrorMessage('');

            } catch (err) {
                setIsLoading(false);
                console.log("Error (Sign Up): ", err);
                setErrorMessage(err.message);
            }
        } else {
            setIsLoading(false);
            setErrorMessage("Enter Email/Password")
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Image source={signupIcon} style={styles.signupicon} />
                <Text style={styles.headText}>Sign Up</Text>
                <TextInput
                    style={styles.inputBox}
                    placeholder='Name'
                    placeholderTextColor='#808080'
                    value={name}
                    onChangeText={(value) => setName(value)}
                />
                <TextInput
                    style={styles.inputBox}
                    placeholder='Email'
                    placeholderTextColor='#808080'
                    value={email}
                    onChangeText={(value) => setEmail(value)}
                />
                <TextInput
                    style={styles.inputBox}
                    placeholder='Password'
                    placeholderTextColor='#808080'
                    value={password}
                    onChangeText={(value) => setPassword(value)}
                    secureTextEntry={true}
                />
                {errorMessage &&
                    <Text style={{ color: 'red' }}>{errorMessage}</Text>
                }
            </View>
            <View style={styles.buttonsBelow}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.button}>Login</Text>
                </TouchableOpacity>

                {!isLoading ? (
                    <TouchableOpacity
                        onPress={handleSignup}
                    >
                        <Text style={styles.button}>Verify Email</Text>
                    </TouchableOpacity>
                ) : (
                    <ActivityIndicator size='large' color='#A1C6EA' />
                )}
            </View>
        </View>
    )
}

const { height, width } = Dimensions.get("screen")
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#04080f'
    },
    headText: {
        color: '#A1C6EA',
        fontSize: 20,
        margin: 10
    },
    signupicon: {
        width: 70,
        height: 70,
    },
    inputContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputBox: {
        width: width - 40,
        borderWidth: 2,
        borderColor: '#A1C6EA',
        color: '#dae3e5',
        fontSize: 20,
        padding: 15,
        marginBottom: 15,
        borderRadius: 10
    },
    button: {
        fontSize: 18,
        padding: 12,
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#A1C6EA',
        color: '#04080F'
    },
    buttonsBelow: {
        padding: 15,
        marginBottom: 15,
        marginHorizontal: 15,
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

export default Signup;