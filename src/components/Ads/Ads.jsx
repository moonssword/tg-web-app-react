import React, { useEffect, useState } from 'react';
import './Ads.css';
import { useTelegram } from '../../hooks/useTelegram';

const Ads = () => {
    const domain = process.env.REACT_APP_DOMAIN;
    const { tg, user } = useTelegram();
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            const userId = user?.id;
            try {
                setIsLoading(true); // Включаем анимацию загрузки перед началом запроса
                const response = await fetch(`${domain}/api/ads?userId=${userId}`);
                const data = await response.json();
                if (data && Array.isArray(data.ads)) {
                    setAds(data.ads);
                } else {
                    setAds([]);
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setIsLoading(false); // Отключаем анимацию загрузки после завершения запроса
            }
        };

        fetchAds();
    }, [user]);

    // Функция для деактивации объявления и удаления из канала
    const deactivateAd = async (adId, messageId, city, userId, channelId) => {
        try {
            console.log(`Deactivating ad with id: ${adId}, message_id: ${messageId}, city: ${city}`);
            
            const response = await fetch(`${domain}/api/ads/${adId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    is_active: false,
                    message_id: messageId,
                    city: city,
                    tg_user_id: userId,
                    tg_channel: channelId
                }),
            });

            const result = await response.json();
            console.log('Response from server:', result);

            if (response.ok) {
                setAds(prevAds => prevAds.filter(ad => ad.id !== adId)); // Удаляем объявление из списка
            } else {
                console.error('Error deactivating ad:', response.statusText);
            }
        } catch (error) {
            console.error('Error deactivating ad:', error);
        }
    };

    // Показать всплывающее окно для подтверждения удаления
    const showConfirmDeletePopup = (adId, messageId, city, userId, channelId) => {
        tg.showPopup({
            title: 'Подтверждение удаления',
            message: 'Вы уверены, что хотите удалить это объявление?',
            buttons: [
                { id: 'confirm', type: 'default', text: 'Да' },
                { id: 'cancel', type: 'destructive', text: 'Отмена' }
            ]
        }, (buttonId) => {
            if (buttonId === 'confirm') {
                deactivateAd(adId, messageId, city, userId, channelId);
            }
        });
    };

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
                <h1>Мои объявления</h1>
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
                                <div className="ad-actions">
                                    <button 
                                        className="deactivate-button-ads" 
                                        onClick={() => showConfirmDeletePopup(ad.id, ad.message_id, ad.city, ad.tg_user_id, ad.tg_channel)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.875 4.375H3.125" stroke="#FF0000" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8.125 8.125V13.125" stroke="#FF0000" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M11.875 8.125V13.125" stroke="#FF0000" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M15.625 4.375V16.25C15.625 16.4158 15.5592 16.5747 15.4419 16.6919C15.3247 16.8092 15.1658 16.875 15 16.875H5C4.83424 16.875 4.67527 16.8092 4.55806 16.6919C4.44085 16.5747 4.375 16.4158 4.375 16.25V4.375" stroke="#FF0000" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M13.125 4.375V3.125C13.125 2.79348 12.9933 2.47554 12.7589 2.24112C12.5245 2.0067 12.2065 1.875 11.875 1.875H8.125C7.79348 1.875 7.47554 2.0067 7.24112 2.24112C7.0067 2.47554 6.875 2.79348 6.875 3.125V4.375" stroke="#FF0000" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p className="no-ads-message">Нет активных объявлений.</p>
                )
            )}
        </div>
    );
};

export default Ads;
