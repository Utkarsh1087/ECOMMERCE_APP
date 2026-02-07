import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets.js'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    if (!token) return

    try {
      const response = await axios.post(
        backendUrl + '/api/order/list',
        {},
        { headers: { token } }
      )

      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        {
          orderId,
          status: event.target.value
        },
        { headers: { token } }
      )

      if (response.data.success) {
        fetchAllOrders()
        toast.success("Order status updated")
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status")
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div className="px-4 md:px-8">
      <h3 className="text-lg font-semibold mb-4">Orders</h3>

      <div className="flex flex-col gap-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="grid grid-cols-1 
                       sm:grid-cols-2 
                       lg:grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1fr_1fr_1fr]
                       gap-4 items-start 
                       border border-gray-200 rounded-lg 
                       p-4 md:p-6 
                       text-sm text-gray-700 bg-white"
          >
            <img src={assets.parcel_icon} alt="parcel" className="w-10" />

            <div>
              {order.items.map((item, i) => (
                <p key={i}>
                  {item.name} × {item.quantity}{' '}
                  <span className="text-gray-500">({item.size})</span>
                </p>
              ))}
            </div>

            <div>
              <p className="font-medium">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {order.address.phone}
              </p>
            </div>

            <div className="text-xs text-gray-600">
              <p>{order.address.street},</p>
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.country} - {order.address.zipcode}</p>
            </div>

            <div className="text-xs">
              <p>Items: {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>
                Payment:{' '}
                <span className={order.payment ? 'text-green-600' : 'text-red-500'}>
                  {order.payment ? 'Done' : 'Pending'}
                </span>
              </p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            <p className="font-semibold">
              {currency}{order.amount}
            </p>

            <select
              value={order.status}
              onChange={(event) => statusHandler(event, order._id)}
              className="border rounded-md px-2 py-1 text-sm
                         focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
