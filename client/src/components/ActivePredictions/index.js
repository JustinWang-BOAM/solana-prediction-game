import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axiosInstance from "../../helpers/axiosInstance";
import BetCard from "../BetCard";

const ActivePredictions = () => {
    const [ isFetching, setIsFetching ] = useState(true);
    const [ predictions, setPredictions ] = useState([]);


    useEffect(() => {
        const searchQuery = {
            // "predictionDeadline": {
            //     "$gte": "2022-07-02T04:37:58.000Z"
            // } //TODO: remove once daily cron job is working
            status: true
        }
        axiosInstance.get('/predictions', searchQuery)
        .then(res => res.data)
        .then(data => {
            setPredictions(data);
            setIsFetching(false);
        })
        .catch(err => {
            setIsFetching(false);
            console.log("Error occured: " + err.message);
        });  
    }, []);

    if(isFetching) {
        return <div>Loading...</div>
    }
    
    return (
        <Flex
            gap={2}
            flexWrap="wrap"
            justifyContent={["center", "center", "flex-start", "flex-start"]}
        >
            {
                predictions.map(prediction => {
                    const { _id } = prediction;
                    return (
                        <BetCard 
                            key={_id} 
                            prediction={prediction}
                        />
                    );
                })
            }
        </Flex>
    )
}
export default ActivePredictions;