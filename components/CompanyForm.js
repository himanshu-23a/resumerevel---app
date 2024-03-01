import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    ToastAndroid,
    ActivityIndicator
} from 'react-native';

API_KEY = '***';
const genAI = new GoogleGenerativeAI(API_KEY);

const CompanyForm = () => {

    const [isLoading, setIsLoading] = useState(false);

    console.log('Company form ')
    const user = auth().currentUser;
    const navigation = useNavigation();

    const [companyJobDesc, setCompanyJobDesc] = useState({
        companyName: '',
        companyWebsite: '',
        companyDesc: '',
        jobTitle: '',
        jobResponsibilty: '',
        JobDesc: ''
    });

    const handleSubmit = async () => {
        console.log('Company Job Description: ', companyJobDesc);

        //To check whether the company job filled form is correct or not
        try {
            setIsLoading(true);
            const prePrompt = `Here is the details of Company and Job: Company Name: ${companyJobDesc.companyName}, Company Website: ${companyJobDesc.companyWebsite}, company Description: ${companyJobDesc.companyDesc}, Job Title: ${companyJobDesc.jobTitle}, Job Responsibility: ${companyJobDesc.jobResponsibilty}, Job Description: ${companyJobDesc.JobDesc}.`;;
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `${prePrompt} Is this a valid company job details? Generate Single Word response (Yes or No)`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(text);
            const containsYes = text.toLowerCase().includes('yes');
            if (containsYes) {
                console.log("This is valid conmapny job ");
                //Upload the company job in firestore
                const userRef = firestore().collection('users').doc(user.uid);

                await userRef.set({
                    companyJob: companyJobDesc,
                }, { merge: true })
                    .then(() => {
                        setIsLoading(false);
                        console.log('Comapny Job Description Stored in Firestore')
                        ToastAndroid.show("Job Description  Uploaded!", ToastAndroid.SHORT);
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        console.error('Error storing company job description in firestore: ', error);
                    });
                setIsLoading(false);
            } else {
                setIsLoading(false);
                console.log("Comapny job information is incorrect !!");
                ToastAndroid.show("The Form is filled incorrect!", ToastAndroid.SHORT);
            }

        } catch (error) {
            console.log("Error in: ", error);
        };

        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView >
                <Text style={styles.headText} >Company Information</Text>
                <TextInput
                    style={styles.inputBox}
                    placeholder='Name'
                    placeholderTextColor='#808080'
                    value={companyJobDesc.companyName}
                    onChangeText={(value) => setCompanyJobDesc({ ...companyJobDesc, companyName: value })}
                />
                <TextInput
                    style={styles.inputBox}
                    placeholder='Website'
                    placeholderTextColor='#808080'
                    value={companyJobDesc.companyWebsite}
                    onChangeText={(value) => setCompanyJobDesc({ ...companyJobDesc, companyWebsite: value })}
                />
                <TextInput
                    style={styles.inputBox}
                    multiline
                    numberOfLines={4}
                    placeholder='Description'
                    placeholderTextColor='#808080'
                    value={companyJobDesc.companyDesc}
                    onChangeText={(value) => setCompanyJobDesc({ ...companyJobDesc, companyDesc: value })}
                />
                <Text style={styles.headText}>Job Information</Text>
                <TextInput
                    style={styles.inputBox}
                    placeholder='Job Title'
                    placeholderTextColor='#808080'
                    value={companyJobDesc.jobTitle}
                    onChangeText={(value) => setCompanyJobDesc({ ...companyJobDesc, jobTitle: value })}
                />
                <TextInput
                    style={styles.inputBox}
                    placeholder='Responsibility'
                    placeholderTextColor='#808080'
                    value={companyJobDesc.jobResponsibilty}
                    onChangeText={(value) => setCompanyJobDesc({ ...companyJobDesc, jobResponsibilty: value })}
                />
                <TextInput
                    style={styles.inputBox}
                    multiline
                    numberOfLines={4}
                    placeholder='Description'
                    placeholderTextColor='#808080'
                    value={companyJobDesc.JobDesc}
                    onChangeText={(value) => setCompanyJobDesc({ ...companyJobDesc, JobDesc: value })}
                />
                {!isLoading ? (
                    <TouchableOpacity
                        onPress={handleSubmit}>
                        <Text style={styles.button}>Submit</Text>
                    </TouchableOpacity>
                ) : (
                    <View>
                        <ActivityIndicator size='large' color='#A1C6EA' />
                    </View>
                )}
            </ScrollView >

        </View >
    );
};

const { height, width } = Dimensions.get("screen")
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#04080f',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15
    },
    headText: {
        fontSize: 24,
        marginVertical: 10,
        color: '#A1C6EA'
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
        alignSelf: 'center',
        fontSize: 18,
        padding: 12,
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#507dbc',
        color: '#dae3e5'
    },
})

export default CompanyForm;
