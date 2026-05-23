package com.proyectocitas.backend.model;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entidad que representa una cita en el consultorio.
 * Vincula a un paciente y a un médico (ambos registrados como usuarios) 
 * con una fecha, hora y estado específicos.
 */
@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Usuario medico;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private String estado; // "ASIGNADA", "CANCELADA", "COMPLETADA"

    // Constructor vacío requerido por JPA
    public Cita() {}

    // ---- Métodos Getter y Setter ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getPaciente() { return paciente; }
    public void setPaciente(Usuario paciente) { this.paciente = paciente; }

    public Usuario getMedico() { return medico; }
    public void setMedico(Usuario medico) { this.medico = medico; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}  
