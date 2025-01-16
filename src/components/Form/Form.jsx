import React, { useCallback, useEffect, useState } from 'react';
import './Form.css';
import { useTelegram } from '../../hooks/useTelegram';
import citiesData from '../../dictionary/citiesData.json';
import formData from '../../dictionary/formData.json';
import { useNavigate, useLocation } from 'react-router-dom';

const Form = () => {
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [microdistrict, setMicrodistrict] = useState('');
    const [districts, setDistricts] = useState([]);
    const [microdistricts, setMicrodistricts] = useState([]);
    const [formValues, setFormValues] = useState({});
    const { tg, user, queryId, onBackButton, hideBackButton } = useTelegram();
    const [adType, setAdType] = useState(formValues?.ad_type || '');
    const location = useLocation();
    const navigate = useNavigate();

    // Отправка на публикацию
    const onSendData = useCallback(() => {

        const errors = [];
    
        if (formValues.description && formValues.description.length > 400) {
            errors.push('⚠️ Описание не должно содержать больше 400 знаков');
        }
    
        const phoneRegex = /^\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
        if (!phoneRegex.test(formValues.phone) && adType === 'rentOut') {
            errors.push('⚠️ Введите корректный номер телефона');
        }
    
        if (formValues.tg_username && formValues.tg_username.length > 20) {
            errors.push('⚠️ Telegram username не может содержать более 20 символов');
        }
    
        if (errors.length > 0) {
            tg.showAlert(errors.join('\n'));
            return;
        }

        const initData = tg.initData;
        const data = {
            city,
            district,
            microdistrict,
            ...formValues,
            initData,
        };

        if (adType === 'rentOut') {
            // Логика для публикации объявления
            fetch(`${process.env.REACT_APP_DOMAIN}/api/web-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => console.log(data))
                .catch((error) => console.error('There has been a problem with your fetch operation:', error));
        } else if (adType === 'rentIn') {
            // Логика для перехода на страницу поиска
            const queryParams = new URLSearchParams({
                city,
                district,
                microdistrict,
                ...formValues,
            }).toString();
    
            navigate(`/search_results?${queryParams}`);
            tg.MainButton.hide();
            tg.SecondaryButton.hide();
        }
    }, [adType, city, district, microdistrict, formValues, tg, navigate]);
    
    // Навигация
    useEffect(() => {
        if (location.state?.from === 'main') {
            onBackButton(() => navigate(-1));
        }

        return () => {
            hideBackButton();
        };
    }, [location.state, navigate]);
    
    // Кнопка Опубликовать/Найти
    useEffect(() => {
        if (adType === 'rentIn') {
            tg.MainButton.setParams({
                text: 'Найти',
            });
            tg.MainButton.show();
    
            tg.SecondaryButton.setParams({
                position: 'top',
                text: 'Добавить поиск в избранное',
            });
        } else {
            tg.MainButton.setParams({
                text: 'Опубликовать',
            });
            tg.SecondaryButton.hide();
        }
    }, [adType]);

    // Кнопка добавить поиск в избранное
    useEffect(() => {
        const onHeartClick = () => {
            tg.showPopup({
                title: '🔖 Добавить в избранное',
                message: 'Мы сохраним настройки фильтров и сообщим о новых объявлениях',
                buttons: [
                    { id: 'confirm', type: 'default', text: 'Добавить' },
                    { id: 'cancel', type: 'destructive', text: 'Отмена' }
                ]
            }, async (buttonId) => {
                if (buttonId === 'confirm') {
                    // Данные для отправки на сервер
                    const initData = tg.initData;
                    const data = {
                        city,
                        district,
                        microdistrict,
                        ...formValues,
                        initData,
                    };
    
                    try {
                        const response = await fetch(
                            `${process.env.REACT_APP_DOMAIN}/api/favorites`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data)
                            }
                        );
    
                        if (response.ok) {
                            const result = await response.json();
                            tg.showAlert('✔️ Поиск добавлен в избранное');
                            tg.SecondaryButton.hide();
                            console.log('Добавлено в избранное:', result);
                        } else {
                            console.error('Ошибка при добавлении в избранное:', response.statusText);
                            tg.showAlert('⚠️ Не удалось добавить поиск в избранное. Попробуйте позже.');
                        }
                    } catch (error) {
                        console.error('Ошибка:', error);
                        tg.showAlert('⚠️ Произошла ошибка. Попробуйте позже.');
                    }
                }
            });
        };
    
        tg.onEvent('secondaryButtonClicked', onHeartClick);
        return () => {
            tg.offEvent('secondaryButtonClicked', onHeartClick);
        };
    }, [tg, city, district, microdistrict, formValues]);

    // Нажатие MainButton
    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData);
        return () => {
            tg.offEvent('mainButtonClicked', onSendData);
        };
    }, [onSendData]);

    // Валидация полей
    useEffect(() => {
        // Проверяем, заполнены ли все необходимые поля
        const isFormValid = 
        (formValues.ad_type === "rentIn" && formValues.house_type && city && formValues.price_min && formValues.price_max && formValues.duration
            && ((formValues.house_type === 'apartment') ? formValues.rooms : true)
            )
        ||
        (formValues.ad_type === "rentOut" 
            && city && district && formValues.price 
            && formValues.address && formValues.ad_type && formValues.house_type && formValues.area
            && ((formValues.house_type === 'apartment') ? formValues.rooms : (formValues.room_type && formValues.room_location))
            && (formValues.deposit ? formValues.deposit_value : true)
            && formValues.floor_current && formValues.floor_total
            && formValues.phone && formValues.author && formValues.description && formValues.duration
            && (formValues.call || formValues.telegram || formValues.whatsapp)
            && (formValues.family || formValues.single || formValues.with_child || formValues.with_pets)
        );/*&& formValues.condition != null*/;
    
        console.log(formValues)
        console.log('isFormValid ' + isFormValid)

        if (!isFormValid) {
            tg.MainButton.hide();
            tg.SecondaryButton.hide();
        } else {
            tg.MainButton.show();
            if (formValues.ad_type === "rentIn") tg.SecondaryButton.show();
        }
    }, [city, district, microdistrict, formValues]);
    

    const onChangeCity = (e) => {
        const selectedCity = e.target.value;
        setCity(selectedCity);
        setDistrict('');
        setMicrodistrict('');
        setDistricts(Object.keys(citiesData[selectedCity] || {}));
    };

    const onChangeDistrict = (e) => {
        const selectedDistrict = e.target.value;
        setDistrict(selectedDistrict);
        setMicrodistrict('');
        setMicrodistricts(citiesData[city][selectedDistrict] || []);
    };

    const onChangeMicrodistrict = (e) => {
        setMicrodistrict(e.target.value);
    };

    const onChangeField = (field, value) => {
        let validatedValue = value;
    
        // Валидация поля tg_username
        if (field === 'tg_username' && value.length > 32) {
            validatedValue = value.slice(0, 32); // Ограничиваем длину
            tg.showAlert('⚠️ Telegram username не может содержать более 32 символов');
        }
    
        setFormValues((prevValues) => ({
            ...prevValues,
            [field]: validatedValue
        }));

        if (field === 'ad_type') {
            setAdType(value);
        }
    };
    

    // Функция для рендера динамических полей
    const renderField = (key, field) => {

        // Проверка зависимости от другого поля
        if (field.depends_on) {
            const dependencies = Array.isArray(field.depends_on) ? field.depends_on : [field.depends_on];
            const visibleIf = field.visible_if;
    
            const isFieldVisible = dependencies.every(depKey => {
                const expectedValues = visibleIf[depKey] || [];
                return expectedValues.includes(formValues[depKey]);
            });
    
            if (!isFieldVisible) {
                return null; // Если хотя бы одно из условий не выполнено, скрываем поле
            }
        }

        let fieldElement;

        // Проверка на кастомный тип поля
        if (key === "location") {
            return (
                <div className="form-field" key={key}>
                    {/* Поле "Город" */}
                    <div className="form-row">
                        <div className="form-label">Город</div>
                        <div className="form-element">
                            <select className="select" value={city} onChange={onChangeCity}>
                                <option value="" disabled hidden>Выберите город</option>
                                {Object.keys(citiesData).map(cityName => (
                                    <option key={cityName} value={cityName}>{cityName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
    
                    {/* Поле "Район" */}
                    {city && (
                        <div className="form-row">
                            <div className="form-label">Район</div>
                            <div className="form-element">
                                <select className="select" value={district} onChange={onChangeDistrict}>
                                    <option value="">Выберите район</option>
                                    {districts.map(districtName => (
                                        <option key={districtName} value={districtName}>{districtName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
    
                    {/* Поле "Микрорайон" */}
                    {district && district !== "Все районы" && microdistricts.length > 0 && (
                        <div className="form-row">
                            <div className="form-label">Микрорайон</div>
                            <div className="form-element">
                                <select className="select" value={microdistrict} onChange={onChangeMicrodistrict}>
                                    <option value="">Выберите микрорайон</option>
                                    {microdistricts.map(microdistrictName => (
                                        <option key={microdistrictName} value={microdistrictName}>{microdistrictName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        
        switch (field.type) {
            case 'select':
                fieldElement = (
                    <select
                        className={'select'}
                        value={formValues[key] || field.defaultValue || ''}
                        onChange={(e) => onChangeField(key, e.target.value)}
                    >
                        <option value="">{field.label}</option>
                        {field.options && field.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
                break;
            case 'text':
                fieldElement = (
                    <input
                        type={field.type}
                        className={'input'}
                        placeholder={field.placeholder}
                        value={formValues[key] || field.defaultValue || ''}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        pattern={field.pattern || ''}
                    />
                );
                break;
            case 'number':
                fieldElement = (
                    <input
                        type={field.type}
                        className={'input'}
                        inputMode="numeric"
                        placeholder={field.placeholder}
                        value={formValues[key] || field.defaultValue || ''}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        pattern={field.pattern || ''}
                    />
                );
                break;
            case 'tel':
                    fieldElement = (
                        <input
                            type="tel"
                            className={'input'}
                            placeholder={field.placeholder}
                            value={formValues[key] || field.defaultValue || ''}
                            onChange={(e) => onChangeField(key, e.target.value)}
                            pattern={field.pattern || ''}
                        />
                    );
                    break;
            case 'textarea':
                fieldElement = (
                    <textarea
                        className={'input'}
                        placeholder={field.placeholder}
                        value={formValues[key] || ''}
                        onChange={(e) => {
                            onChangeField(key, e.target.value);
                            e.target.style.height = 'auto'; // Сбрасываем высоту
                            e.target.style.height = `${e.target.scrollHeight}px`; // Устанавливаем высоту по контенту
                        }}
                    />
                );
                break;                

            case 'checkbox':
                fieldElement = field.options && field.options.map(option => (
                    <label 
                        key={option.value} 
                        className={`checkbox-label button-checkbox ${formValues[option.value] ? 'active' : ''}`}
                    >
                        <input
                            type="checkbox"
                            checked={formValues[option.value] || false}
                            onChange={(e) => onChangeField(option.value, e.target.checked)}
                            style={{ display: 'none' }} // Скрываем стандартный чекбокс
                        />
                        {option.label}
                    </label>
                ));
                break;
            case 'radio':
                fieldElement = (
                    <div className="form_radio_group">
                        {field.options && field.options.map((option, index) => (
                            <div key={option.value} className="form_radio_group-item">
                                <input
                                    type="radio"
                                    id={`${key}_${option.value}`}
                                    name={key}
                                    value={option.value}
                                    checked={formValues[key] === option.value || (!formValues[key] && field.defaultValue === option.value)}
                                    onChange={(e) => onChangeField(key, option.value)}
                                    disabled={field.disabled || false} // поддержка disabled состояния
                                />
                                <label htmlFor={`${key}_${option.value}`}>
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );
                break;
            default:
                return null;
        }

        if (key === "tg_username") {
            field.placeholder = user?.username || '';
        }

        return (
            <div key={key} className="form-row">
                <div className="form-label">
                    {field.label} {field.required && <span className="required">*</span>}
                </div>
                <div className="form-element">{fieldElement}</div>
            </div>
        );
    };

    return (
        <div className={"form"}>
        {/* <h3>Новое объявление</h3> */}
            {/* Динамическая генерация дополнительных полей из JSON */}
            {Object.keys(formData).map((key) => {
                const fieldElement = renderField(key, formData[key]);
                return fieldElement ? (
                    <div key={key} className={'form-field'}>
                        {fieldElement}
                    </div>
                ) : null;
            })}
        </div>
    );
};

export default Form;
