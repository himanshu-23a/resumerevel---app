import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StackActions, useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import CompanyInsightsIcon from '../icons/companyAnalyse.png'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';

API_KEY = 'AIzaSyBrz7otKhlUaX8IYLCWy6ph4MXgWlqQMVU';
const genAI = new GoogleGenerativeAI(API_KEY);

const CompanyInsights = () => {
    const navigation = useNavigation();

    const user = auth().currentUser;
    const [isCompanyInsightsAvail, setIsCompanyInsightsAvail] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [companyInsights, setCompanyInsights] = useState({
        fitScore: '',
        keywordsMatchScore: '',
        skillsMatchList: '',
        optimizationTips: '',
        industryTips: '',
        feedback: '',
        interviewQuestions: ''
    });

    const [resumeData, setResumeData] = useState(null);
    const [companyJob, setcompanyJob] = useState(null);

    useEffect(() => {
        //Initially - to check company insights is available on cloud or not
        const initialChecking = async () => {
            const userRef = firestore().collection('users').doc(user.uid);
            setIsLoading(true)
            await userRef.get()
                .then((doc) => {
                    if (doc.exists && doc.data().companyInsights) {
                        setCompanyInsights(doc.data().companyInsights);
                        console.log('Insights available!', doc.data().companyInsights);
                        setIsCompanyInsightsAvail(true);
                    }
                    if (doc.exists && doc.data().resumeData) {
                        setResumeData(doc.data().resumeData);
                    }
                    if (doc.exists && doc.data().companyJob) {
                        setcompanyJob(doc.data().companyJob);
                    }
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error('Error getting user document: ', error);
                })
        }
        initialChecking();
    }, []);

    const analyzeResume = async () => {

        console.log("Company insight function called");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            const prePrompt = `Here is the details of Company and Job: Company Name: ${companyJob.companyName}, Company Website: ${companyJob.companyWebsite}, company Description: ${companyJob.companyDesc}, Job Title: ${companyJob.jobTitle}, Job Responsibility: ${companyJob.jobResponsibilty}, Job Description: ${companyJob.JobDesc}. and given the image of resume. `;
            console.log("prePrompt: ", prePrompt);

            //To get fit score 
            try {
                const prompt = `${prePrompt} Rate the resume's overall fit for the job based on skills and experience between 0 to 100. (response with only the score that is one word)`;
                console.log("Prompt: ", prompt);
                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Fit Score", text);
                setCompanyInsights((prevCompanyInsights) => {
                    const updatedInsights = { ...prevCompanyInsights, fitScore: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get keywords match score
            try {
                const prompt = `${prePrompt} Rate the resume's keywords match with the job between 0 to 100. (response with only the score that is one word)`;
                console.log("Prompt: ", prompt);
                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("KeyWord Match Score", text);
                setCompanyInsights((prevCompanyInsights) => {
                    const updatedInsights = { ...prevCompanyInsights, keywordsMatchScore: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get Skills matched list
            try {
                const prompt = `${prePrompt} Analyze and list key skills from the resume that align with the job requirements (Only provide list)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Skills Matched List", text);
                setCompanyInsights((prevCompanyInsights) => {
                    const updatedInsights = { ...prevCompanyInsights, skillsMatchList: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get Optimization Tips
            try {
                const prompt = `${prePrompt} Generate personalized recommendations to optimize the resume for better job matching. (Only provide list)`;
                console.log("Prompt: ", prompt);
                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Optimization Tips", text);
                setCompanyInsights((prevCompanyInsights) => {
                    const updatedInsights = { ...prevCompanyInsights, optimizationTips: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get InterView Questions
            try {
                const prompt = `${prePrompt} Generate high order interview questions from the given company job, emphasizing skills, experience, and cultural fit (List out only questions in numering format)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Interview Questions: ", text);
                setCompanyInsights((prevCompanyInsights) => {
                    const updatedInsights = { ...prevCompanyInsights, interviewQuestions: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }

            //To get Industry tips
            try {
                const prompt = `${prePrompt} Offer insights on industry-specific preferences. (Write in a single paragraph)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Industry Tips: ", text);
                setCompanyInsights((prevCompanyInsights) => {
                    const updatedInsights = { ...prevCompanyInsights, industryTips: text };
                    return updatedInsights;
                });

            } catch (err) {
                console.log("Error in this :", err);
            }


            //To get feedback & improvement
            try {
                const prompt = `${prePrompt} Provide constructive feedback on this resume by referring the job provided by the company. (Write in a single paragraph)`;
                console.log("Prompt: ", prompt);

                const imagePart = resumeData;
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                console.log("Feedback ", text);
                setCompanyInsights((prevInsights) => {
                    const updatedInsights = { ...prevInsights, feedback: text };

                    //To update the insights in the firebase
                    const userRef = firestore().collection('users').doc(user.uid);
                    console.log("Company Insights: ", updatedInsights);
                    userRef.set({
                        companyInsights: updatedInsights,
                    }, { merge: true })
                        .then(() => {
                            setIsCompanyInsightsAvail(true);
                            console.log('Company Insights stored in Firestore')
                        })
                        .catch((error) => {
                            console.error('Error storing Company insights in firestore: ', error);
                        });
                    return updatedInsights;
                });
                setIsLoading(false);
            } catch (err) {
                setIsLoading(false);
                console.log("Error in this :", err);
            }
        } catch (error) {
            setIsLoading(false);
            console.log("Error in generating insights: ", error);
        }
    };

    const handleAnalyzeResume = async () => {
        setIsLoading(true);
        await analyzeResume();
        setIsLoading(false);
    };

    const handleDeleteCompany = () => {
        Alert.alert('Alert', 'Are you sure to Delete the Company Info ?', [
            {
                text: 'Cancel',
                onPress: () => {
                    console.log('Cancel');
                },
            },
            {
                text: 'Ok',
                onPress: async () => {
                    console.log('Ok ')
                    setIsLoading(true);
                    try {


                        const userRef = firestore().collection('users').doc(user.uid);
                        await userRef.update({
                            companyJob: firestore.FieldValue.delete(),
                            companyInsights: firestore.FieldValue.delete()
                        });
                        setIsLoading(false);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        });
                        setIsLoading(false);
                    } catch (err) {
                        setIsLoading(false);
                        console.log(err);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>

            {!isLoading ? (
                isCompanyInsightsAvail ?
                    (
                        <View style={{ flex: 1 }}>
                            <View style={styles.buttonRow}>
                                <Text style={[styles.headText, { fontWeight: 500 }]}>Job Fit Insights</Text>
                            </View>
                            <ScrollView>
                                <View style={styles.scoreRow}>
                                    <View style={[styles.card, { flex: 1, backgroundColor: "#C6E2E9", }]}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.title}>Job Fit Score</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.cardBody}>
                                            <Text style={[styles.description, { fontWeight: 600, fontSize: 18 }]}>{companyInsights.fitScore}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.card, { flex: 1, backgroundColor: "#FFCAAF", }]}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.title}>Keyword Match Score</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.cardBody}>
                                            <Text style={[styles.description, { fontWeight: 600, fontSize: 18 }]}>{companyInsights.keywordsMatchScore}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.card, { backgroundColor: "#A7BED3" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Skills Matched</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{companyInsights.skillsMatchList}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { backgroundColor: "#f1ffc4" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Optimization Tips</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{companyInsights.optimizationTips}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { backgroundColor: "#DAB894" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Industry Tips</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{companyInsights.industryTips}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { backgroundColor: "#FFCAAF" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>Feedback</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{companyInsights.feedback}</Text>
                                    </View>
                                </View>
                                <View style={[styles.card, { backgroundColor: "#A7BED3" }]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>interview Questions</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.cardBody}>
                                        <Text style={[styles.description, { fontWeight: 500 }]}>{companyInsights.interviewQuestions}</Text>
                                    </View>
                                </View>
                            </ScrollView >

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={handleAnalyzeResume}
                                >
                                    <Text style={[styles.button, { fontWeight: 600 }]}>Regenerate Analysis</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleDeleteCompany}
                                >
                                    <Text style={[styles.button, { backgroundColor: '#D2122E', fontWeight: 600, color: 'white' }]}>Clear Company Info</Text>
                                </TouchableOpacity>
                            </View>
                        </View >

                    ) : (
                        <View style={styles.inContainer}>
                            <Image source={CompanyInsightsIcon} style={styles.companyinsightsicon} />
                            <TouchableOpacity
                                onPress={handleAnalyzeResume}
                            >
                                <Text style={[styles.button, { fontWeight: 600 }]}>Generate Insights</Text>
                            </TouchableOpacity>

                        </View>

                    )
            ) : (
                <View style={styles.inContainer}>
                    <ActivityIndicator size='large' color='#A1C6EA' />
                    <Text style={{ fontSize: 16, margin: 10 ,color:'#A1C6EA' }}>Loading...This may take longer than usual!</Text>
                </View>
            )}
        </ View>
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
    headText: {
        margin: 20,
        fontSize: 22,
        color: '#A1C6EA'
    },
    companyinsightsicon: {
        width: 100,
        height: 100,
        marginVertical: 20
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    button: {
        fontSize: 18,
        padding: 12,
        marginHorizontal: 8,
        marginVertical: 10,
        borderRadius: 8,
        backgroundColor: '#A1C6EA',
        color: '#04080F'
    },
    scoreRow: {
        flexDirection: 'row',
    },
    divider: {
        backgroundColor: '#04080f',
        height: 1,
        marginTop: 10
    },
    card: {
        borderRadius: 8,
        padding: 16,
        margin: 5,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#04080f",
    },
    cardBody: {
        marginTop: 16,
    },
    description: {
        fontSize: 16,
        color: "#04080f",
    },
});

export default CompanyInsights;