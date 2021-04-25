import React from 'react'
import './InfoBox.css'
import { Card, CardContent, Typography } from '@material-ui/core'

function InfoBox({ title, current, active, isRed, total, ...props }) {
  return <div className='info'>
    <Card onClick={props.onClick} className={`infoBox ${active && "infoBox--selected"}  ${isRed && "infoBox--red"}`}>
      <CardContent>
        <Typography color="textSecondary" className="info-box-title">
          {title}
        </Typography>
        <h2 className={`info-box-cases ${!isRed && "info-box-cases--green"}`}>{current}</h2>
        <Typography color="textSecondary" className="info-box-total">{total} Total</Typography>
      </CardContent>
    </Card>
  </div>
}

export default InfoBox
