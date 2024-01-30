import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ResumeInsights from './ResumeInsights';
import RNFS from "react-native-fs";
import uploadfileIcon from '../icons/uploadfile.png'
//import PDF from 'react-native-pdf';
import {
    View,
    Text,
    StyleSheet,
    ToastAndroid,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

API_KEY = 'AIzaSyBrz7otKhlUaX8IYLCWy6ph4MXgWlqQMVU';
const genAI = new GoogleGenerativeAI(API_KEY);

const Home = () => {

    const navigation = useNavigation();
    
    const [isResume, setIsResume] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const user = auth().currentUser;

    useEffect(() => {
        //Initially - to check resume is available on cloud or not
        const checkInitial = async () => {
            setIsLoading(true);
            const userRef = firestore().collection('users').doc(user.uid);
            await userRef.get()
                .then((doc) => {
                    if (doc.exists && doc.data().resumeUrl) {
                        console.log('Resume URL is available', doc.data().resumeUrl);
                        setIsResume(true);
                        setResumeUrl(doc.data().resumeUrl);
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error('Error getting user document: ', error);
                })
            setIsLoading(false);
        };
        checkInitial();
    }, []);

    //Function to convert the file to base64
    async function fileToGenerativePart(fileInfo) {
        console.log("filetobase64 called", fileInfo);

        try {
            const base64Data = await RNFS.readFile(fileInfo[0].fileCopyUri, "base64");
            console.log("base64 data: ");
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: fileInfo[0].type,
                },
            };
        }
        catch (err) {
            console.log("Error in converting to base64 data : ", err);
        }
    };

    //upload resume function - called on button pressed
    const uploadResume = async () => {
        //To pick the image
        try {
            setIsLoading(true)
            const resume = await new Promise(async (resolve, reject) => {
                try {
                    const result = await DocumentPicker.pick({
                        type: [DocumentPicker.types.images],
                        copyTo: 'cachesDirectory',
                    });
                    console.log("result  ", result);
                    resolve(result);
                } catch (err) {
                    setIsLoading(false)
                    reject(err);
                }
            });

            console.log("Image picked: ", resume);
            //To check whether image is resume or not - Gemini 

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
                const prompt = "Is this image a resume? Generate Single Word response (Yes or No)";
                const imagePart = await fileToGenerativePart(resume);
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Output from gemini:", text);
                const containsYes = text.toLowerCase().includes('yes');

                if (containsYes) {
                    console.log("This is valid Resume");
                    //If it is a valid resume
                    try {
                        const storageRef = storage().ref(`/Resume/${user.uid}`);
                        const uploadResume = storageRef
                            .putFile(resume[0]?.fileCopyUri);

                        uploadResume.on(
                            'state_changed',
                            (snapshot) => {
                                console.log(`${snapshot.bytesTransferred} transferred out of ${snapshot.totalBytes}`);
                            },
                            (error) => {
                                console.error(error);
                            },
                            () => {
                                // Task completed successfully
                                //Upload the imagePart and downloadUrl in firestore databse
                                storageRef.getDownloadURL().then((downloadURL) => {
                                    console.log('File available at', downloadURL);
                                    const userRef = firestore().collection('users').doc(user.uid);
                                    userRef.set({
                                        resumeData: imagePart, //Storing imagePart in firebase for further use
                                        resumeUrl: downloadURL,
                                    }, { merge: true })
                                        .then(async () => {
                                            console.log('Download URL stored in Firestore')
                                            setResumeUrl(downloadURL);
                                            setIsResume(true);
                                            setIsLoading(false);
                                            ToastAndroid.show("Resume Uploaded!", ToastAndroid.SHORT);
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: 'Main' }],
                                            });
                                        })
                                        .catch((error) => {
                                            setIsLoading(false)
                                            console.error('Error storing downloadURL in firestore: ', error);
                                        });
                                });
                            }
                        );

                    } catch (err) {
                        setIsLoading(false)
                        console.log("Error Uploading file: ", err);
                    }
                }
                else {
                    setIsLoading(false);
                    console.log("Selected image is not a resume!!");
                    ToastAndroid.show("Selected image is not a resume!", ToastAndroid.SHORT);
                }
            } catch (err) {
                console.log("Error prompting to gemini!");
            }

        } catch (err) {
            setIsLoading(false)
            console.log("Error picking the file: ", err);
        };
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.inContainer}>
                    <ActivityIndicator size='large' color='#A1C6EA' />
                    <Text style={{ fontSize: 16, margin: 10 ,color:'#A1C6EA' }}>Loading...This may take longer than usual!</Text>
                </View>
            ) : (
                !isResume ? (
                    < View style={styles.inContainer}>
                        <Image source={uploadfileIcon} style={styles.uploadfileicon} />
                        <TouchableOpacity
                            onPress={uploadResume}
                        >
                            <Text style={styles.uploadButton}>Upload Resume</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ResumeInsights resumeUrl={resumeUrl} />
                )
            )}
        </View >
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#04080f',
    },
    inContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadfileicon: {
        width: 100,
        height: 100
    },
    uploadButton: {
        fontSize: 18,
        padding: 12,
        marginHorizontal: 10,
        marginVertical: 30,
        borderRadius: 8,
        backgroundColor: '#A1C6EA',
        color: '#04080F'
    }
});

export default Home;