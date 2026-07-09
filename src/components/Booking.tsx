import { useMemo, useState } from "react";
import { SALON, BOOKING_SERVICES } from "../lib/content";
import MagneticButton from "./MagneticButton";
import Reveal from "./Reveal";
import "./Booking.css";

const TIMES = ["10:00", "11:30", "14:00", "16:00", "18:30"];

/**
 * Section 9 — Booking. A service selector + date/time, then a magnetic primary
 * CTA that carries the choices through to the atelier's booking link.
 */
export default function Booking() {
  const [service, setService] = useState(BOOKING_SERVICES[0]);
  const today = useMemo(() => {
    // Deterministic default: leave empty so the guest chooses.
    return "";
  }, []);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(TIMES[0]);

  const bookingHref = useMemo(() => {
    const url = new URL(SALON.bookingUrl);
    url.searchParams.set("service", service);
    if (date) url.searchParams.set("date", date);
    url.searchParams.set("time", time);
    return url.toString();
  }, [service, date, time]);

  return (
    <section id="booking" className="section booking" aria-label="Book your appointment">
      <div className="section-inner booking__inner">
        <Reveal className="booking__intro" stagger>
          <span className="eyebrow">Reserve your ritual</span>
          <h2 className="section-title">Book your appointment.</h2>
          <p className="lede">New guests welcome; consultations included.</p>
        </Reveal>

        <Reveal className="booking__panel" y={44}>
          <div className="booking__field">
            <label htmlFor="bk-service">Treatment</label>
            <div className="booking__select">
              <select
                id="bk-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {BOOKING_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="booking__chevron" aria-hidden="true" />
            </div>
          </div>

          <div className="booking__field">
            <label htmlFor="bk-date">Preferred date</label>
            <input
              id="bk-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="booking__field">
            <label>Time</label>
            <div className="booking__times" role="radiogroup" aria-label="Preferred time">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={time === t}
                  className={`booking__time ${time === t ? "is-active" : ""}`}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <MagneticButton
            href={bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="booking__cta"
          >
            Book your appointment
          </MagneticButton>
          <p className="booking__note">
            You'll confirm the final slot with us — every booking begins with a
            short consultation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
