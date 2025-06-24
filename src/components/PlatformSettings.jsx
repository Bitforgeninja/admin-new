import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlatformSettings() {
    const [settings, setSettings] = useState({
        upiId: '',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        adminAddress: '',
        qrCodeUrl: '',
        bannerImageUrl: '',
        whatsAppNumber: '',
        pin: '' // For display only, not for access control
    });
    const [pinAccess, setPinAccess] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const CORRECT_PIN = '1603'; // 🔐 Hardcoded access PIN

    const [qrImage, setQrImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);

    useEffect(() => {
        if (!pinAccess) return; // prevent fetch unless pin is entered

        const fetchSettings = async () => {
            try {
                const response = await axios.get('https://backend-pbn5.onrender.com/api/admin/platform-settings', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });

                const {
                    adminContact,
                    upiId,
                    bannerImageUrl,
                    qrCodeUrl,
                    whatsAppNumber,
                    pin
                } = response.data;

                setSettings({
                    upiId: upiId || '',
                    adminName: adminContact?.name || '',
                    adminEmail: adminContact?.email || '',
                    adminPhone: adminContact?.phone || '',
                    adminAddress: adminContact?.address || '',
                    qrCodeUrl: qrCodeUrl || '',
                    bannerImageUrl: bannerImageUrl || '',
                    whatsAppNumber: whatsAppNumber || '',
                    pin: pin || ''
                });
            } catch (error) {
                console.error('Error fetching settings', error);
            }
        };

        fetchSettings();
    }, [pinAccess]);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (enteredPin === CORRECT_PIN) {
            setPinAccess(true);
        } else {
            alert("❌ Incorrect PIN!");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e, type) => {
        if (type === 'qrCode') {
            setQrImage(e.target.files[0]);
        } else if (type === 'banner') {
            setBannerImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('upiId', settings.upiId);
        formData.append('adminContact[name]', settings.adminName);
        formData.append('adminContact[email]', settings.adminEmail);
        formData.append('adminContact[phone]', settings.adminPhone);
        formData.append('adminContact[address]', settings.adminAddress);
        formData.append('whatsAppNumber', settings.whatsAppNumber);
        formData.append('pin', settings.pin);

        if (qrImage) formData.append('qrCode', qrImage);
        if (bannerImage) formData.append('bannerImage', bannerImage);

        try {
            const response = await axios.put('https://backend-pbn5.onrender.com/api/admin/platform-settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Error updating settings', error);
        }
    };

    // 🔐 PIN Lock Screen UI
    if (!pinAccess) {
        return (
            <div className="container mx-auto p-8">
                <h2 className="text-2xl font-bold mb-4">🔒 Enter PIN to access Platform Settings</h2>
                <form onSubmit={handlePinSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm mx-auto">
                    <input
                        type="password"
                        className="border border-gray-300 p-2 w-full rounded mb-4"
                        placeholder="Enter PIN"
                        value={enteredPin}
                        onChange={(e) => setEnteredPin(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                    >
                        Unlock
                    </button>
                </form>
            </div>
        );
    }

    // ✅ Main Settings UI (only after correct PIN)
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-lg font-bold mb-4">Platform Settings</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-md font-bold mb-2">Current Settings</h3>
                    <ul>
                        <li><strong>UPI ID:</strong> {settings.upiId}</li>
                        <li><strong>Admin Name:</strong> {settings.adminName}</li>
                        <li><strong>Admin Email:</strong> {settings.adminEmail}</li>
                        <li><strong>Admin Phone:</strong> {settings.adminPhone}</li>
                        <li><strong>Admin Address:</strong> {settings.adminAddress}</li>
                        <li><strong>WhatsApp Number:</strong> {settings.whatsAppNumber}</li>
                        <li><strong>PIN Code:</strong> {settings.pin}</li>
                        <li><strong>QR Code:</strong> <img src={settings.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} /></li>
                        <li><strong>Banner Image:</strong> <img src={settings.bannerImageUrl} alt="Banner" style={{ width: '300px', height: '100px' }} /></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-md font-bold mb-2">Edit Settings</h3>
                    <form onSubmit={handleSubmit}>
                        {[
                            { id: 'upiId', label: 'UPI ID' },
                            { id: 'adminName', label: 'Admin Contact Name' },
                            { id: 'adminEmail', label: 'Admin Contact Email', type: 'email' },
                            { id: 'adminPhone', label: 'Admin Contact Phone', type: 'tel' },
                            { id: 'adminAddress', label: 'Admin Contact Address' },
                            { id: 'whatsAppNumber', label: 'WhatsApp Number' },
                            { id: 'pin', label: 'Platform PIN' },
                        ].map(({ id, label, type = 'text' }) => (
                            <div className="mb-4" key={id}>
                                <label htmlFor={id} className="block mb-2">{label}:</label>
                                <input type={type} id={id} name={id} value={settings[id]} onChange={handleChange} className="p-2 border rounded w-full" />
                            </div>
                        ))}
                        <div className="mb-4">
                            <label htmlFor="qrCode" className="block mb-2">Upload QR Code:</label>
                            <input type="file" id="qrCode" onChange={(e) => handleImageChange(e, 'qrCode')} className="p-2 border rounded" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="bannerImage" className="block mb-2">Upload Banner Image:</label>
                            <input type="file" id="bannerImage" onChange={(e) => handleImageChange(e, 'banner')} className="p-2 border rounded" />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PlatformSettings;
