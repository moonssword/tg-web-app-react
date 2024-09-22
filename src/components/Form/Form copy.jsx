import React, {useCallback, useEffect, useState} from 'react';
import './Form.css';
import { useTelegram } from '../../hooks/useTelegram';
import citiesData from '../../dictionary/citiesData.json';  // Импортируем JSON файл

const Form = () => {
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [microdistrict, setMicrodistrict] = useState('');
    const [districts, setDistricts] = useState([]);
    const [microdistricts, setMicrodistricts] = useState([]);
    const {tg} = useTelegram();

    const onSendData = useCallback(() => {
        const data = {
            city,
            district,
            microdistrict
        };
        tg.sendData(JSON.stringify(data));
    }, [city, district, microdistrict]);

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData);
        return () => {
            tg.offEvent('mainButtonClicked', onSendData);
        };
    }, [onSendData]);

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Опубликовать'
        });
    }, []);

    useEffect(() => {
        if (!district || !city) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    }, [city, district]);

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

    return (
        <div className={"form"}>
            <h3>Новое объявление</h3>
            
            {/* Поле "Город" */}
            <select className={'input'} value={city} onChange={onChangeCity}>
                <option value="">Выберите город</option>
                {Object.keys(citiesData).map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                ))}
            </select>

            {/* Поле "Район" отображается только если выбран город */}
            {city && (
                <select className={'input'} value={district} onChange={onChangeDistrict}>
                    <option value="">Выберите район</option>
                    {districts.map(districtName => (
                        <option key={districtName} value={districtName}>{districtName}</option>
                    ))}
                </select>
            )}

            {/* Поле "Все микрорайоны" отображается только если выбран конкретный район (не "Все районы") */}
            {district && district !== "Все районы" && (
                <select className={'select'} value={microdistrict} onChange={onChangeMicrodistrict}>
                    <option value="">Все микрорайоны</option>
                    {microdistricts.map(microdistrictName => (
                        <option key={microdistrictName} value={microdistrictName}>{microdistrictName}</option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default Form;
