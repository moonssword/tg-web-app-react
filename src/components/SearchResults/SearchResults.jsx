import React, { useEffect, useState } from 'react';
import './SearchResults.css';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

const SearchResults = () => {
    const domain = process.env.REACT_APP_DOMAIN;
    const { tg, onBackButton, hideBackButton } = useTelegram();
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        onBackButton(() => navigate(-1));

        return () => {
            hideBackButton();
        };
    }, [navigate]);

    useEffect(() => {
        const fetchAds = async () => {
            const queryParams = new URLSearchParams(location.search);
            
            try {
                setIsLoading(true);
                const response = await fetch(`${domain}/api/search?${queryParams}`);
                const data = await response.json();

                if (response.ok && Array.isArray(data.ads)) {
                    setAds(data.ads);
                } else {
                    console.error('Unexpected response format:', data);
                    setAds([]);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                setAds([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAds();
    }, [domain, location.search]);

    const formatAdMessage = (ad) => {
        const tgChannel = ad.tg_channel ? ad.tg_channel.replace('@', '') : 'unknown_channel';
        const messageId = Array.isArray(ad.message_id) && ad.message_id.length > 0 ? ad.message_id[0] : 'unknown_message';

        return (
            <>
                <strong><a href={`https://t.me/${tgChannel}/${messageId}`} target="_blank" rel="noopener noreferrer">
                    Объявление {ad.id}
                </a></strong>
                <br />
                <br />
                {ad.house_type === 'apartment' ? `${ad.rooms}-комн. квартира` : ad.house_type === 'room' ? 'Комната' : 'Дом'} 
                {ad.duration === 'long_time' ? ' на длительный срок' : ' посуточно'}
                <br />
                Адрес: {ad.city}
                {ad.district ? `, ${ad.district} р-н` : ''}
                {ad.microdistrict ? `, ${ad.microdistrict}` : ''}
                {ad.address ? `, ${ad.address}` : ''}
                <br />
                Цена: {ad.price} ₸
                <br />
                Телефон: {ad.phone}
                <br />
            </>
        );
    };

    return (
        <div className="ads-container">
            <div className="ads-header">
                <h1>Найденные объявления</h1>
            </div>
            {isLoading ? (
                <div className="loading-spinner">
                    <div className="loader"></div>
                </div>
            ) : (
                ads.length > 0 ? (
                    <ul className="ads-list">
                        {ads.map(ad => (
                            <div key={ad.id} className="ad-item">
                                <div className="ad-text">
                                    <p>{formatAdMessage(ad)}</p>
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p className="no-ads-message">Объявления не найдены</p>
                )
            )}
        </div>
    );
};

export default SearchResults;
