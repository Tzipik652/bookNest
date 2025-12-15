import { useState } from 'react';

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

export const useGeoLocation = () => {
    const [locationState, setLocationState] = useState<GeoLocationState>({
        coordinates: null,
        address: '',
        isLoading: false,
        error: null,
    });

    const fetchAddress = async (lat: number, lon: number,lang: string): Promise<string> => {
        const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
        if (!apiKey) {
            console.error("Geoapify API key is missing");
            return "";
        }

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

    const getAddressFromCoordinates = async (lat: number, lon: number, lang: string = 'en') => {
        if (lat === 0 && lon === 0) return;

        setLocationState(prev => ({ ...prev, isLoading: true, error: null }));
        const address = await fetchAddress(lat, lon, lang);
        setLocationState(prev => ({
            ...prev,
            isLoading: false,
            coordinates: { lat, lon },
            address
        }));
    };

    const getCurrentLocation = (lang: string = 'en') => {
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

                const address = await fetchAddress(latitude, longitude, lang);

                setLocationState({
                    coordinates: { lat: latitude, lon: longitude },
                    address: address,
                    isLoading: false,
                    error: null,
                });
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
    };

    return {
        ...locationState,
        getCurrentLocation,
        getAddressFromCoordinates
    };
};