import React from 'react'

const NewsLetterBox = () => {

const onSubmitHandler=(event)=>{
event.preventDefault();  // Prevent page reload on form submission
}


    return (
        <div className='text-center'>
            <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 20% off</p>
            <p className='text-gray-400 mt-3'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint dolorem nobis aperiam, nostrum quos, debitis assumenda repellat commodi laborum molestias hic explicabo, perspiciatis nemo neque beatae. Vitae voluptate at omnis.</p>
           
            <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-enter gap-3 mx-auto my-6 border pl-3'>
                <input type="email" placeholder='Enter your email' className='w-full sm:flex-1 outline-none' name="" id="" required />
                <button type="submit" className='bg-black text-white text-xs px-10 py-4'>Subscribe</button>
            </form>
        </div>
    )
}

export default NewsLetterBox
