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
    const deactivateAd = async (adId, messageId, city, userId) => {
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
                    tg_user_id: userId
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
    const showConfirmDeletePopup = (adId, messageId, city, userId) => {
        tg.showPopup({
            title: 'Подтверждение удаления',
            message: 'Вы уверены, что хотите удалить это объявление?',
            buttons: [
                { id: 'confirm', type: 'default', text: 'Да' },
                { id: 'cancel', type: 'destructive', text: 'Отмена' }
            ]
        }, (buttonId) => {
            if (buttonId === 'confirm') {
                deactivateAd(adId, messageId, city, userId);
            }
        });
    };

    const formatAdMessage = (ad) => {
        return `${ad.house_type === 'apartment' ? `${ad.rooms}-комн. квартира` : ad.house_type === 'room' ? 'Комната' : 'Дом'} 
${ad.duration === 'long_time' ? 'на длительный срок' : 'посуточно'}
Город: ${ad.city}${ad.district ? ', ' + ad.district + ' р-н' : ''}${ad.microdistrict ? ', ' + ad.microdistrict : ''}${ad.address ? ', ' + ad.address : ''}
Цена: ${ad.price} ₸
Телефон: ${ad.phone}
`;
    };

    return (
        <div className="ads-container">
            <h1>Мои объявления</h1>
            {isLoading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка...</p>
                </div>
            ) : (
                ads.length > 0 ? (
                    <ul className="ads-list">
                        {ads.map(ad => (
                            <div key={ad.id} className="ad-item">
                                <div className="ad-text">
                                    <pre>{formatAdMessage(ad)}</pre>
                                </div>
                                <div className="ad-actions">
                                    <button 
                                        className="deactivate-button" 
                                        onClick={() => showConfirmDeletePopup(ad.id, ad.message_id, ad.city, ad.tg_user_id)}
                                    >
                                        Удалить
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