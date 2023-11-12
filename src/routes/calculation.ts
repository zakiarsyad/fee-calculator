import csvParser from 'csv-parser';
import { Router } from 'express';
import moment from 'moment';

import { Readable } from 'stream';
import { TotalFare, fareMapper, fileUploader, validLines } from '../middlewares';

const router = Router();

router.post('/', fileUploader('csv'), (req, res, next) => {
    const csvFile = req.file;
    if (!csvFile) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    let fare: TotalFare = {
        total: 0,
    };

    let isCsvError = false;
    Readable.from(csvFile.buffer)
        .pipe(csvParser({ headers: false }))
        .on('data', (row) => {
            const fromLine = row['0'].toLowerCase();
            const toLine = row['1'].toLowerCase();
            const route = `${fromLine}${toLine}`;

            const inputDate = row['2'];
            const date = moment(inputDate);

            if (
                (!fromLine || !toLine || !inputDate) ||
                (fromLine && !validLines.includes(fromLine)) ||
                (toLine && !validLines.includes(toLine)) ||
                !date.isValid()
            ) {
                isCsvError = true;
                return
            }

            fare = fareMapper(fare, route, date);
        })
        .on('end', () => {
            if (isCsvError) {
                return next(Error('CSV_VALIDATION_ERROR'))
            }

            res.status(200).send({
                total_fare: fare.total
            });
        })
        .on('error', (error) => {
            next(error)
        });
});

export const CalculationRouter: Router = router;
