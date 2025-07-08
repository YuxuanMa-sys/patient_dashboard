/* eslint-disable */
import { DateTime } from 'luxon';

/* Get the current instant */
const now = DateTime.now();

export const notifications = [
    {
        id: '493190c9-5b61-4912-afe5-78c21f1044d7',
        userAvatar: 'images/avatars/female-03.jpg',
        userName: 'Sarah Johnson',
        message: 'has requested for a virtual appointment on 27th September, 2021 | 04:30 pm',
        time: now.minus({ minute: 27 }).toISO(), // 27 minutes ago
        read: false,
    },
    {
        id: '6e3e97e5-effc-4fb7-b730-52a151f0b641',
        userAvatar: 'images/avatars/male-04.jpg',
        userName: 'Michael Chen',
        message: 'has requested for an in-person appointment on 28th September, 2021 | 02:15 pm',
        time: now.minus({ minute: 45 }).toISO(), // 45 minutes ago
        read: true,
    },
    {
        id: 'b91ccb58-b06c-413b-b389-87010e03a120',
        userAvatar: 'images/avatars/female-02.jpg',
        userName: 'Emma Wilson',
        message: 'has requested to cancel her virtual appointment scheduled on 29th September, 2021 | 10:00 am',
        time: now.minus({ hour: 1, minute: 15 }).toISO(), // 1 hour 15 minutes ago
        read: false,
    },
    {
        id: '541416c9-84a7-408a-8d74-27a43c38d797',
        userAvatar: 'images/avatars/male-01.jpg',
        userName: 'David Rodriguez',
        message: 'has requested for an in-person appointment on 30th September, 2021 | 09:30 am',
        time: now.minus({ hour: 2, minute: 30 }).toISO(), // 2 hours 30 minutes ago
        read: false,
    },
    {
        id: 'ef7b95a7-8e8b-4616-9619-130d9533add9',
        userAvatar: 'images/avatars/female-04.jpg',
        userName: 'Lisa Anderson',
        message: 'has requested for a virtual appointment on 1st October, 2021 | 03:45 pm',
        time: now.minus({ hour: 3, minute: 10 }).toISO(), // 3 hours 10 minutes ago
        read: true,
    },
    {
        id: 'eb8aa470-635e-461d-88e1-23d9ea2a5665',
        userAvatar: 'images/avatars/male-02.jpg',
        userName: 'James Miller',
        message: 'has requested to cancel his virtual appointment scheduled on 2nd October, 2021 | 11:15 am',
        time: now.minus({ hour: 4, minute: 20 }).toISO(), // 4 hours 20 minutes ago
        read: true,
    },
    {
        id: 'b85c2338-cc98-4140-bbf8-c226ce4e395e',
        userAvatar: 'images/avatars/female-01.jpg',
        userName: 'Maria Garcia',
        message: 'has requested for a virtual appointment on 3rd October, 2021 | 01:20 pm',
        time: now.minus({ hour: 5, minute: 40 }).toISO(), // 5 hours 40 minutes ago
        read: true,
    },
    {
        id: '8f8e1bf9-4661-4939-9e43-390957b60f42',
        userAvatar: 'images/avatars/male-03.jpg',
        userName: 'Robert Thompson',
        message: 'has requested to cancel his virtual appointment scheduled on 4th October, 2021 | 04:00 pm',
        time: now.minus({ hour: 6, minute: 15 }).toISO(), // 6 hours 15 minutes ago
        read: true,
    },
    {
        id: '30af917b-7a6a-45d1-822f-9e7ad7f8bf69',
        userAvatar: 'images/avatars/female-05.jpg',
        userName: 'Jennifer Lee',
        message: 'has requested for a virtual appointment on 5th October, 2021 | 02:30 pm',
        time: now.minus({ day: 1, hour: 2 }).toISO(), // 1 day 2 hours ago
        read: true,
    },
];
