import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
    lat: number;
    lon: number;
}

interface GeoLocationState {
    coordinates: Coordinates | null;
    address: string;
    isLoading: boolean;
    error: string | null;
}

export const useGeoLocation = (autoFetch: boolean = false) => { // הוספנו פרמטר להפעלה אוטומטית
    const [locationState, setLocationState] = useState<GeoLocationState>({
        coordinates: null,
        address: '',
        isLoading: false,
        error: null,
    });

    const fetchAddress = async (lat: number, lon: number, lang: string): Promise<string> => {
        const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
        if (!apiKey) return "";

        try {
            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}&lang=${lang}`
            );
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                return data.features[0].properties.formatted;
            }
        } catch (err) {
            console.error("Failed to fetch address", err);
        }
        return "";
    };

    const getAddressFromCoordinates = useCallback(async (lat: number, lon: number, lang: string = 'en') => {
        if (lat === 0 && lon === 0) return;

        // עדכון שנטען, אבל משאירים את הקואורדינטות אם יש
        setLocationState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const address = await fetchAddress(lat, lon, lang);
        
        setLocationState(prev => ({
            ...prev,
            isLoading: false,
            coordinates: { lat, lon }, // מוודאים שהקואורדינטות מעודכנות
            address
        }));
    }, []);

    const getCurrentLocation = useCallback((lang: string = 'en') => {
        setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!navigator.geolocation) {
            setLocationState((prev) => ({
                ...prev,
                isLoading: false,
                error: "הדפדפן לא תומך בשירותי מיקום",
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // שיפור ביצועים קריטי:
                // 1. קודם כל מעדכנים קואורדינטות (כדי שחישוב המרחק יעבוד מיד)
                setLocationState(prev => ({
                    ...prev,
                    coordinates: { lat: latitude, lon: longitude },
                    // עדיין טוען כי אנחנו מחכים לכתובת
                    isLoading: true 
                }));

                // 2. רק אחר כך מביאים את הכתובת
                const address = await fetchAddress(latitude, longitude, lang);

                // 3. מעדכנים את הכתובת ומסיימים טעינה
                setLocationState(prev => ({
                    ...prev,
                    address: address,
                    isLoading: false,
                    error: null,
                }));
            },
            (error) => {
                setLocationState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: "לא ניתן לקבל מיקום. אנא ודאי שה-GPS דלוק ושיש הרשאה.",
                }));
            },
            { enableHighAccuracy: true }
        );
    }, []);

    useEffect(() => {
        if (autoFetch) {
            getCurrentLocation();
        }
    }, [autoFetch, getCurrentLocation]);

    return {
        ...locationState,
        getCurrentLocation,
        getAddressFromCoordinates
    };
};