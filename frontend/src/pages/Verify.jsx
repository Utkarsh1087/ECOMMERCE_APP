import React, { useEffect } from 'react';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verify = () => {
    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
    const [searchParams] = useSearchParams();

    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');

    const verifyPayment = async () => {
        try {
            if (!token) {
                return null;
            }

            const response = await axios.post(
                backendUrl + '/api/order/verifyStripe',
                { success, orderId, sessionId },
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems({});
                navigate('/orders');
            } else {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || error.message);
            navigate('/cart');
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-gray-500">Verifying your payment, please wait...</p>
        </div>
    );
};

export default Verify;
