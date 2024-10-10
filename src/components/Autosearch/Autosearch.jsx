import React, { useEffect, useState } from 'react';
import './Autosearch.css';
import { useTelegram } from '../../hooks/useTelegram';

const Autosearch = () => {
    const domain = process.env.REACT_APP_DOMAIN;
    const { tg, user } = useTelegram();
    const [searches, setSearches] = useState([]);
    const [formData, setFormData] = useState({
        city: '',
        price_min: '',
        price_max: '',
        room_type: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchSearches = async () => {
            const userId = user?.id;
            try {
                setIsLoading(true); // Включаем анимацию загрузки перед началом запроса
                const response = await fetch(`${domain}/sc?userId=${userId}`);
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
        console.log(`Deactivating search with criteriaId: ${criteriaId}`);
        
        const response = await fetch(`${domain}/sc/${criteriaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: false }), // Передаем поле для деактивации
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

const formatMessage = (data) => {
    return `Сниму ${data.house_type === 'apartment' ? data.rooms + '-комн. квартиру' : data.house_type === 'room' ? 'комнату' : 'дом'}${data.duration === 'long_time' ? ' на длительный срок' : 'посуточно'}
Город: ${data.city}${data.district ? ', ' + data.district + ' р-н' : ''}${data.microdistrict ? ', ' + data.microdistrict : ''}
Цена: ${data.price_min}-${data.price_max} ₸
Телефон: ${data.phone}
`;
};

    return (
        <div className="autosearch-container">
            <h1>Сохраненные поиски</h1>
            {isLoading ? ( // Отображаем анимацию загрузки, пока идет запрос
            <div className="loading-spinner">
                <div className="spinner"></div> {/* Анимация загрузки */}
                <p>Загрузка...</p>
            </div>
            ) : (
                searches.length > 0 ? (
                    <ul className="search-list">
                        {searches.map(search => (
                            <div key={search.criteria_id} className="search-item">
                                <div className="search-text">
                                    <pre>{formatMessage(search)}</pre>
                                </div>
                                <div className="search-actions">
                                    <button 
                                        className="deactivate-button" 
                                        onClick={() => deactivateSearch(search.criteria_id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p className="no-searches-message">Нет сохраненных поисков.</p>
                )
            )}
        </div>
    );
};

export default Autosearch;
