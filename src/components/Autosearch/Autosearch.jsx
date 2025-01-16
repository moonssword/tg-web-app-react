import React, { useEffect, useState } from 'react';
import './Autosearch.css';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate, useLocation } from 'react-router-dom';

const Autosearch = () => {
    const domain = process.env.REACT_APP_DOMAIN;
    const { tg, user, onBackButton, hideBackButton } = useTelegram();
    const [searches, setSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.from === 'main') {
            onBackButton(() => navigate(-1));
        }

        return () => {
            hideBackButton();
        };
    }, [location.state, onBackButton, hideBackButton, navigate]);

    useEffect(() => {
        const fetchSearches = async () => {
            const userId = user?.id;
            try {
                setIsLoading(true); // Включаем анимацию загрузки перед началом запроса
                const initData = tg.initData;
                const response = await fetch(`${domain}/api/sc`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ initData }),
                });

                const data = await response.json();
                if (data && Array.isArray(data.searchCriteria)) {
                    setSearches(data.searchCriteria);
                } else {
                    setSearches([]);
                }
            } catch (error) {
                console.error('Error fetching searches:', error);
            } finally {
                setIsLoading(false); // Отключаем анимацию загрузки после завершения запроса
            }
        };

        fetchSearches();
    }, [user]);

    // Функция для деактивации критерия
    const deactivateSearch = async (criteriaId) => {
        try {
            const initData = tg.initData;
            console.log(`Deactivating search with criteriaId: ${criteriaId}`);
            
            const response = await fetch(`${domain}/api/sc/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    criteria_id: criteriaId,
                    is_active: false,
                    initData: initData,
                }),
            });

            const result = await response.json();
            console.log('Response from server:', result);

            if (response.ok) {
                setSearches(prevSearches => prevSearches.filter(search => search.criteria_id !== criteriaId));
            } else {
                console.error('Error deactivating search:', response.statusText);
            }
        } catch (error) {
            console.error('Error deactivating search:', error);
        }
    };

    // Показать всплывающее окно для подтверждения удаления
    const showConfirmDeletePopup = (criteriaId) => {
        tg.showPopup({
            title: '🗑️ Удалить поиск?',
            message: 'Вы не будете получать уведомления о новых объявлениях',
            buttons: [
                { id: 'confirm', type: 'destructive', text: 'Удалить' },
                { id: 'cancel', type: 'default', text: 'Отмена' }
            ]
        }, (buttonId) => {
            if (buttonId === 'confirm') {
                deactivateSearch(criteriaId);
            }
        });
    };

    const formatMessage = (data) => {
        const category = data.house_type === 'apartment' ? 'Квартиры' : data.house_type === 'room' ? 'Комнаты' : 'Дома';
        const rentalPeriod = data.duration === 'long_time' ? 'На длительный срок' : 'Посуточно';
        const roomInfo = data.house_type === 'apartment' && data.rooms ? `Количество комнат: ${data.rooms}` : '';
        const price = `${data.price_min}-${data.price_max} ₸ в месяц`;
    
        return (
            <>
                <strong>{data.city}</strong>
                {data.district && `, ${data.district} р-н`}
                {data.microdistrict && `, ${data.microdistrict}`}
                <br />
                Категория: {category}
                <br />
                Тип объявления: Снять
                <br />
                Срок аренды: {rentalPeriod}
                <br />
                {roomInfo && <>{roomInfo}<br /></>}
                Арендная плата: {price}
                <br />
            </>
        );
    };         
    
    return (
        <div className="autosearch-container">
            {/* <h1>Сохраненные поиски</h1> */}
            {isLoading ? ( // Отображаем анимацию загрузки, пока идет запрос
            <div className="loading-spinner">
                <div className="loader"></div> {/* Анимация загрузки */}
            </div>
            ) : (
                searches.length > 0 ? (
                    <ul className="search-list">
                        {searches.map(search => (
                            <div key={search.criteria_id} className="search-item">
                                <div className="search-text">
                                    <p>{formatMessage(search)}</p>
                                </div>
                                <div className="search-actions">
                                    <button 
                                        className="deactivate-button-sc" 
                                        onClick={() => showConfirmDeletePopup(search.criteria_id)}
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
                    <div className="no-searches-container">
                    <p className="no-searches-message">Сохраните параметры поиска и будьте в курсе новых объявлений</p>
                    <img 
                        src="/save_search_button.png" 
                        alt="Add search button" 
                        className="how-save-ad-image" 
                    />
                </div>
                )
            )}
        </div>
    );
};

export default Autosearch;
